import { Body, Controller, Delete, Get, Param, Patch, Post, NotFoundException } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CurrentUserId } from "../auth/current-user-id.decorator";

@Controller("categories")
export class CategoriesController {
    constructor(private service: CategoriesService) { }

    @Get()
    list(@CurrentUserId() userId?: string) {
        if (!userId) throw new NotFoundException("User not identified");
        return this.service.list(userId);
    }

    @Post()
    create(@CurrentUserId() userId: string, @Body() dto: CreateCategoryDto) {
        return this.service.create(userId, dto);
    }

    @Patch(":id")
    update(@CurrentUserId() userId: string, @Param("id") id: string, @Body() dto: UpdateCategoryDto) {
        return this.service.update(userId, id, dto);
    }

    @Delete(":id")
    delete(@CurrentUserId() userId: string, @Param("id") id: string) {
        return this.service.delete(userId, id);
    }
}