import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { QueueModule } from "../queue/queue.module";
import { AlertsController } from "./alerts.controller";
import { BudgetAlertService } from "./budget-alert.service";

@Module({
    imports: [PrismaModule, QueueModule],           // <-- has the queue
    controllers: [AlertsController],                // <-- wire controller
    providers: [BudgetAlertService],                // <-- provide service
    exports: [BudgetAlertService],                  // (optional) if used elsewhere
})
export class NotificationsModule { }