import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    list(userId: string) {
        return this.prisma.category.findMany({
            where: { userId },
            orderBy: { name: "asc" },
        });
    }

    create(userId: string, dto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: { userId, name: dto.name, parentId: dto.parentId ?? null },
        });
    }

    update(userId: string, id: string, dto: UpdateCategoryDto) {
        return this.prisma.category.update({
            where: { id, userId },
            data: { ...dto, parentId: dto.parentId ?? null },
        });
    }

    delete(userId: string, id: string) {
        return this.prisma.category.delete({ where: { id, userId } });
    }
}