import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AnalyticsController } from "./analytics.controller";
import { CacheModule } from "../cache";
import { QueueModule } from "../queue/queue.module";

@Module({
    imports: [PrismaModule, CacheModule, QueueModule],
    controllers: [AnalyticsController],
})
export class AnalyticsModule { }