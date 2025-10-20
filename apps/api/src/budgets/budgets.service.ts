import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBudgetDto, BudgetPeriod } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";

function currentRange(period: BudgetPeriod) {
    const now = new Date();
    if (period === BudgetPeriod.YEAR) {
        const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        const to = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
        return { from, to };
    }
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { from, to };
}

@Injectable()
export class BudgetsService {
    constructor(private prisma: PrismaService) { }

    async list(userId: string) {
        const budgets = await this.prisma.budget.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });

        const withProgress = await Promise.all(
            budgets.map(async (b) => {
                const { from, to } = currentRange(b.period as any);
                let rows: Array<{ spend: number }>;
                if (b.categoryId) {
                    rows = await this.prisma.$queryRaw<Array<{ spend: number }>>`
                    SELECT COALESCE(SUM(CASE WHEN t."amount" < 0 THEN -t."amount" ELSE 0 END), 0)::numeric AS spend
                    FROM "Transaction" t
                    WHERE t."userId" = ${userId}
                    AND t."categoryId" = ${b.categoryId}
                    AND t."date" >= ${from}
                    AND t."date" < ${to}
                `;
                } else {
                    rows = await this.prisma.$queryRaw<Array<{ spend: number }>>`
                    SELECT COALESCE(SUM(CASE WHEN t."amount" < 0 THEN -t."amount" ELSE 0 END), 0)::numeric AS spend
                    FROM "Transaction" t
                    WHERE t."userId" = ${userId}
                    AND t."date" >= ${from}
                    AND t."date" < ${to}
                `;
                }
                const spent = Number(rows[0]?.spend ?? 0);
                const amount = Number(b.amount);
                const remaining = Math.max(0, amount - spent);
                const percent = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;

                return {
                    ...b,
                    amount,
                    progress: { spent, remaining, percent },
                };
            })
        );

        return withProgress;
    }

    create(userId: string, dto: CreateBudgetDto) {
        return this.prisma.budget.create({
            data: {
                userId,
                categoryId: dto.categoryId ?? null,
                period: dto.period,
                amount: dto.amount,
            },
        });
    }

    update(userId: string, id: string, dto: UpdateBudgetDto) {
        return this.prisma.budget.update({
            where: { id },
            data: {
                ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
                ...(dto.period !== undefined ? { period: dto.period } : {}),
                ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
            },
        });
    }

    async remove(userId: string, id: string) {
        const b = await this.prisma.budget.findFirst({ where: { id, userId } });
        if (!b) return { ok: false };
        await this.prisma.budget.delete({ where: { id } });
        return { ok: true };
    }
}