import { Inject, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Queue } from "bullmq";
import { NOTIFICATIONS_QUEUE } from "../queue/queue.module";
import { BudgetPeriod, Prisma } from "@prisma/client";

@Injectable()
export class BudgetAlertService {
    private readonly log = new Logger(BudgetAlertService.name);
    constructor(
        private prisma: PrismaService,
        @Inject("NOTIFICATIONS_QUEUE") private queue: Queue
    ) { }

    private currentRange(period: BudgetPeriod) {
        const now = new Date();
        if (period === "YEAR") {
            const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
            const to = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
            return { from, to };
        }
        const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        return { from, to };
    }

    async checkUserBudgets(userId: string) {
        const prefs = await this.prisma.notificationPref.upsert({
            where: { userId }, update: {}, create: { userId },
        });
        if (!prefs.budgetAlertsEnabled) return { ok: true, skipped: "disabled" };

        const budgets = await this.prisma.budget.findMany({
            where: { userId },
            include: { category: true },
        });

        for (const b of budgets) {
            const { from, to } = this.currentRange(b.period);

            const catFilter = b.categoryId
                ? Prisma.sql`AND t."categoryId" = ${b.categoryId}`
                : Prisma.sql``;

            const rows = await this.prisma.$queryRaw<Array<{ spend: unknown }>>(Prisma.sql`
        SELECT
          COALESCE(SUM(CASE WHEN t."amount" < 0 THEN -t."amount" ELSE 0 END), 0)::numeric AS spend
        FROM "Transaction" t
        WHERE t."userId" = ${userId}
          ${catFilter}
          AND t."date" >= ${from}
          AND t."date" < ${to}
      `);

            const spent = Number((rows?.[0] as any)?.spend ?? 0);
            const amount = Number(b.amount);
            if (amount <= 0) continue;

            const pct = (spent / amount) * 100;
            const name = b.category?.name ?? "All categories";

            if (prefs.threshold80Enabled && pct >= 80 && pct < 100) {
                await this.queue.add(
                    "notify",
                    {
                        userId,
                        subject: `Heads up: ${Math.round(pct)}% of ${name} ${b.period.toLowerCase()} budget`,
                        text: `You have used ${spent.toFixed(2)} of ${amount.toFixed(2)} for ${name}.`,
                    },
                    { removeOnComplete: true }
                );
            }
            if (prefs.threshold100Enabled && pct >= 100) {
                await this.queue.add(
                    "notify",
                    {
                        userId,
                        subject: `⚠️ Budget reached for ${name}`,
                        text: `You've reached ${spent.toFixed(2)} of ${amount.toFixed(2)} for ${name}.`,
                    },
                    { removeOnComplete: true }
                );
            }
        }
        return { ok: true };
    }
}