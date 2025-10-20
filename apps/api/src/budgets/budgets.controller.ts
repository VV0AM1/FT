import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { BudgetsService } from "./budgets.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";
import { CurrentUserId } from "../auth/current-user-id.decorator";

@Controller("budgets")
export class BudgetsController {
    constructor(private service: BudgetsService) { }

    @Get()
    list(@CurrentUserId() userId: string) {
        return this.service.list(userId);
    }

    @Post()
    create(@CurrentUserId() userId: string, @Body() dto: CreateBudgetDto) {
        return this.service.create(userId, dto);
    }

    @Patch(":id")
    update(@CurrentUserId() userId: string, @Param("id") id: string, @Body() dto: UpdateBudgetDto) {
        return this.service.update(userId, id, dto);
    }

    @Delete(":id")
    remove(@CurrentUserId() userId: string, @Param("id") id: string) {
        return this.service.remove(userId, id);
    }
}