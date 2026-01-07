import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardMetrics(userId: string, month?: number, year?: number) {
        const now = new Date();
        const targetYear = year || now.getFullYear();
        const targetMonth = month !== undefined ? month - 1 : now.getMonth(); // 0-indexed in JS Date

        const currentMonthStart = new Date(targetYear, targetMonth, 1);
        const nextMonthStart = new Date(targetYear, targetMonth + 1, 1);

        const previousMonthStart = new Date(targetYear, targetMonth - 1, 1);
        const previousMonthEnd = currentMonthStart;

        // Fetch Current Month Transactions
        const currentTransactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: currentMonthStart,
                    lt: nextMonthStart,
                },
            },
            include: { category: true },
        });

        // Fetch Previous Month Transactions
        const previousTransactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: previousMonthStart,
                    lt: previousMonthEnd,
                },
            },
        });

        const currentMetrics = this.calculateMetrics(currentTransactions);
        const previousMetrics = this.calculateMetrics(previousTransactions);

        // Group by Category (Current Month)
        const categoryMap = new Map<string, number>();
        currentTransactions.forEach(t => {
            if (Number(t.amount) < 0) { // Only track expenses
                const catName = t.category?.name || "Uncategorized";
                const amount = Math.abs(Number(t.amount));
                categoryMap.set(catName, (categoryMap.get(catName) || 0) + amount);
            }
        });

        const categoryDistribution = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Group by Day for Charts (Current Month)
        const dayMap = new Map<string, { income: number, expense: number }>();
        // Initialize all days in month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dateKey = new Date(now.getFullYear(), now.getMonth(), i).toLocaleDateString('en-CA'); // YYYY-MM-DD
            dayMap.set(dateKey, { income: 0, expense: 0 });
        }

        currentTransactions.forEach(t => {
            const dateKey = t.date.toISOString().split('T')[0];
            const amount = Number(t.amount);
            if (dayMap.has(dateKey)) {
                const day = dayMap.get(dateKey)!;
                if (amount > 0) day.income += amount;
                else day.expense += Math.abs(amount);
            }
        });

        const dailyTrends = Array.from(dayMap.entries())
            .map(([date, values]) => ({ date, ...values }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            currentMonth: currentMetrics,
            previousMonth: previousMetrics,
            trends: {
                incomeChange: this.calculatePercentageChange(previousMetrics.income, currentMetrics.income),
                expenseChange: this.calculatePercentageChange(previousMetrics.expense, currentMetrics.expense),
            },
            categories: categoryDistribution,
            history: dailyTrends
        };
    }

    private calculateMetrics(transactions: any[]) {
        let income = 0;
        let expense = 0;

        for (const t of transactions) {
            const amount = Number(t.amount);
            if (amount > 0) {
                income += amount;
            } else {
                expense += Math.abs(amount);
            }
        }

        return { income, expense, net: income - expense };
    }

    private calculatePercentageChange(oldVal: number, newVal: number): number {
        if (oldVal === 0) return newVal > 0 ? 100 : 0;
        return ((newVal - oldVal) / oldVal) * 100;
    }
}
