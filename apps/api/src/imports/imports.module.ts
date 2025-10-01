import { Module } from "@nestjs/common";
import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";
import { PrismaModule } from "../prisma/prisma.module";
import { S3Module } from "../s3/s3.module";
import { QueueModule } from "../queue/queue.module";
import { Queue } from "bullmq";

@Module({
    imports: [PrismaModule, S3Module, QueueModule],
    controllers: [ImportsController],
    providers: [ImportsService],
})

export class ImportsModule { }