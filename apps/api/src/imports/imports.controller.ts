import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ImportsService } from "./imports.service";
import { CreatePresignDto } from "./dto/create-presign.dto";
import { CompleteUploadDto } from "./dto/complete.dto";
import { CurrentUserId } from "../auth/current-user-id.decorator";

@Controller("imports")
export class ImportsController {
    constructor(private service: ImportsService) { }

    @Get()
    list(@CurrentUserId() userId: string) {
        return this.service.list(userId);
    }

    @Get(":id")
    get(@CurrentUserId() userId: string, @Param("id") id: string) {
        return this.service.get(userId, id);
    }

    @Post()
    presign(@CurrentUserId() userId: string, @Body() dto: CreatePresignDto) {
        return this.service.presign(userId, dto);
    }

    @Post("complete")
    complete(@CurrentUserId() userId: string, @Body() dto: CompleteUploadDto) {
        return this.service.complete(userId, dto);
    }
}