import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MockProviderService } from "./mock-provider.service";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const shortId = (n = 8) => randomUUID().replace(/-/g, "").slice(0, n);

@Injectable()
export class ConnectionsService {
    constructor(
        private prisma: PrismaService,
        private provider: MockProviderService,
        private s3: S3Client,
    ) { }

    async institutions() {
        return this.provider.listInstitutions();
    }

    async list(userId: string) {
        return this.prisma.connection.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async create(userId: string, institutionId: string) {
        const conn = await this.prisma.connection.create({
            data: { userId, institutionId, accessToken: "mock_access_" + shortId(8) },
        });

        const accounts = await this.provider.getAccounts(conn.accessToken);
        for (const a of accounts) {
            await this.prisma.account.upsert({
                where: { externalId_userId: { externalId: a.externalId, userId } },
                update: { name: a.name, type: a.type, balance: a.balance },
                create: {
                    userId,
                    name: a.name,
                    type: a.type,
                    balance: a.balance,
                    externalId: a.externalId,
                    connectionId: conn.id,
                },
            });
        }
        return conn;
    }

    async syncAccount(userId: string, accountId: string) {
        const account = await this.prisma.account.findFirst({
            where: { id: accountId, userId },
            include: { connection: true },
        });
        if (!account || !account.connection) return { ok: false };

        const rows = await this.provider.getTransactions(
            account.connection.accessToken,
            account.externalId!,
            80,
        );

        const header = "Date,Description,Amount\n";
        const body = rows.map(r => `${r.Date},${r.Description},${r.Amount}`).join("\n");
        const bucket = process.env.S3_BUCKET!;
        const key = `${userId}/sync-${Date.now()}-${shortId(6)}.csv`;

        await this.s3.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: Buffer.from(header + body),
                ContentType: "text/csv",
            }),
        );

        const file = await this.prisma.importFile.create({
            data: {
                userId,
                filename: key.split("/").pop()!,
                key,
                size: Buffer.byteLength(header + body),
                contentType: "text/csv",
                status: "PENDING",
            },
        });

        // enqueue using BullMQ
        const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });
        const queue = new Queue("imports", { connection });
        await queue.add(
            "process-import",
            { importFileId: file.id, bucket, key, userId },
            { removeOnComplete: true },
        );
        await queue.close();
        connection.disconnect();

        return { ok: true, fileId: file.id };
    }
}