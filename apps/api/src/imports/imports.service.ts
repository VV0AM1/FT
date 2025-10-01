import { PrismaService } from "../prisma/prisma.service";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { nanoid } from "nanoid";
import { CreatePresignDto } from "./dto/create-presign.dto";
import { CompleteUploadDto } from "./dto/complete.dto";
import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import type { Queue } from "bullmq";
import { randomUUID } from "node:crypto";

@Injectable()
export class ImportsService {
    constructor(
        private prisma: PrismaService,
        private s3: S3Client,
        @Inject("IMPORTS_QUEUE") private queue: Queue,
    ) { }
    async presign(userId: string, dto: CreatePresignDto) {
        const bucket = process.env.S3_BUCKET!;
        const shortId = () => randomUUID().replace(/-/g, "").slice(0, 6);
        const key = `${userId}/${Date.now()}-${shortId()}-${dto.filename}`;

        const { url, fields } = await createPresignedPost(this.s3, {
            Bucket: bucket,
            Key: key,
            Conditions: [
                ["content-length-range", 1, Math.max(dto.size, 50_000_000)],
                ["starts-with", "$Content-Type", ""],
            ],
            Fields: { "Content-Type": dto.contentType },
            Expires: 60,
        });

        return { url, fields, key, bucket };
    }

    async complete(userId: string, dto: CompleteUploadDto) {
        if (!dto.key.includes(userId)) {
            throw new BadRequestException("key does not belong to user");
        }
        const file = await this.prisma.importFile.create({
            data: {
                userId,
                filename: dto.filename,
                key: dto.key,
                size: dto.size,
                contentType: dto.contentType,
                status: "PENDING",
            },
        });

        await this.queue.add(
            "process-import",
            { importFileId: file.id, bucket: process.env.S3_BUCKET, key: dto.key, userId },
            { removeOnComplete: true, removeOnFail: false }
        );

        return file;
    }

    get(userId: string, id: string) {
        return this.prisma.importFile.findFirst({ where: { id, userId } });
    }

    list(userId: string) {
        return this.prisma.importFile.findMany({
            where: { userId },
            orderBy: { uploadedAt: "desc" },
            take: 50,
        });
    }
}