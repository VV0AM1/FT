import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { QueueModule } from "../queue/queue.module";
import { BudgetAlertService } from "./budget-alert.service";

@Module({
    imports: [PrismaModule, QueueModule],
    providers: [BudgetAlertService],
    exports: [BudgetAlertService],
})
export class BudgetAlertModule { }