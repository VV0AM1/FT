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

    async update(userId: string, id: string, data: { name?: string; type?: string; balance?: number }) {
        // Ensure ownership
        const account = await this.prisma.account.findUnique({ where: { id } });
        if (!account || account.userId !== userId) {
            throw new Error("Account not found or access denied");
        }
        return this.prisma.account.update({
            where: { id },
            data,
        });
    }

    async delete(userId: string, id: string) {
        // Ensure ownership
        const account = await this.prisma.account.findUnique({ where: { id } });
        if (!account || account.userId !== userId) {
            throw new Error("Account not found or access denied");
        }
        return this.prisma.account.delete({
            where: { id },
        });
    }
}