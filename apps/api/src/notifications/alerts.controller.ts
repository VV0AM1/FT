import { Controller, Post } from "@nestjs/common";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { BudgetAlertService } from "./budget-alert.service";

@Controller("alerts")
export class AlertsController {
    constructor(private svc: BudgetAlertService) { }

    @Post("check-budgets")
    check(@CurrentUserId() userId: string) {
        return this.svc.checkUserBudgets(userId);
    }
}