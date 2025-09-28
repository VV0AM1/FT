import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAccountDto } from "./dto/create-account.dto";

@Injectable()
export class AccountsService {
    constructor(private prisma: PrismaService) { }

    list(userId: string) {
        return this.prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    create(userId: string, dto: CreateAccountDto) {
        return this.prisma.account.create({
            data: {
                userId,
                name: dto.name,
                type: dto.type,
                balance: dto.openingBalance ?? 0,
            },
        });
    }
}