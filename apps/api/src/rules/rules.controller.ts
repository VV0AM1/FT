import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { RulesService } from "./rules.service";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { UpdateRuleDto } from "./dto/update-rule.dto";
import { CurrentUserId } from "../auth/current-user-id.decorator";

@Controller("rules")
export class RulesController {
    constructor(private service: RulesService) { }

    @Get()
    list(@CurrentUserId() userId: string) {
        return this.service.list(userId);
    }

    @Post()
    create(@CurrentUserId() userId: string, @Body() dto: CreateRuleDto) {
        return this.service.create(userId, dto);
    }

    @Patch(":id")
    update(@CurrentUserId() userId: string, @Param("id") id: string, @Body() dto: UpdateRuleDto) {
        return this.service.update(userId, id, dto);
    }

    @Delete(":id")
    delete(@CurrentUserId() userId: string, @Param("id") id: string) {
        return this.service.delete(userId, id);
    }
}