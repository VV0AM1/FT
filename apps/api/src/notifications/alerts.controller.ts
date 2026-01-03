import { Body, Controller, Post, Req } from "@nestjs/common";
import { BudgetAlertService } from "./budget-alert.service";
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("alerts")
export class AlertsController {
    constructor(private alerts: BudgetAlertService) { }

    @Post("check")
    async check(@Req() req: any) {
        const userEmail = req.headers["x-user-email"] as string;
        return this.alerts.checkByEmail(userEmail);
    }
}
