import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { UpdateRuleDto } from "./dto/update-rule.dto";

@Injectable()
export class RulesService {
    constructor(private prisma: PrismaService) { }

    list(userId: string) {
        return this.prisma.rule.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });
    }

    create(userId: string, dto: CreateRuleDto) {
        return this.prisma.rule.create({
            data: { userId, contains: dto.contains, categoryId: dto.categoryId, active: dto.active ?? true },
        });
    }

    update(userId: string, id: string, dto: UpdateRuleDto) {
        return this.prisma.rule.update({ where: { id, userId }, data: dto });
    }

    delete(userId: string, id: string) {
        return this.prisma.rule.delete({ where: { id, userId } });
    }
}