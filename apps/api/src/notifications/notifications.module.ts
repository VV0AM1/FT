import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { QueueModule } from "../queue/queue.module";

@Module({
    imports: [PrismaModule, QueueModule],
    controllers: [NotificationsController],
})
export class NotificationsModule { }