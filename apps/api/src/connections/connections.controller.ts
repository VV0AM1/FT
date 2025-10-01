import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ConnectionsService } from "./connections.service";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { CreateConnectionDto } from "./dto";

@Controller()
export class ConnectionsController {
    constructor(private svc: ConnectionsService) { }

    @Get("institutions")
    institutions() {
        return this.svc.institutions();
    }

    @Get("connections")
    list(@CurrentUserId() userId: string) {
        return this.svc.list(userId);
    }

    @Post("connections")
    create(@CurrentUserId() userId: string, @Body() dto: CreateConnectionDto) {
        return this.svc.create(userId, dto.institutionId);
    }

    @Post("accounts/:id/sync")
    sync(@CurrentUserId() userId: string, @Param("id") id: string) {
        return this.svc.syncAccount(userId, id);
    }
}