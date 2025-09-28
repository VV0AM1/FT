import { Body, Controller, Get, Post } from "@nestjs/common";
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
}