import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { CurrentUserId } from "../auth/current-user-id.decorator";

@Controller("accounts")
export class AccountsController {
    constructor(private service: AccountsService) { }

    @Get()
    list(@CurrentUserId() userId: string) {
        return this.service.list(userId);
    }

    @Post()
    create(@CurrentUserId() userId: string, @Body() dto: CreateAccountDto) {
        return this.service.create(userId, dto);
    }

    @Patch(":id")
    update(@CurrentUserId() userId: string, @Param("id") id: string, @Body() body: any) {
        return this.service.update(userId, id, body);
    }

    @Delete(":id")
    remove(@CurrentUserId() userId: string, @Param("id") id: string) {
        return this.service.delete(userId, id);
    }
}