import { Controller, Get, Query } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CacheService } from "../cache/cache.service";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { Prisma } from "@prisma/client"; // ← add this

@Controller("analytics")
export class AnalyticsController {
    constructor(private prisma: PrismaService, private cache: CacheService) { }

    @Get("spend-by-category")
    async spendByCategory(
        @CurrentUserId() userId: string,
        @Query("from") from?: string,
        @Query("to") to?: string,
    ) {
        const key = this.cache.key("analytics", userId, "spend-by-category", from || "null", to || "null");
        const cached = await this.cache.getJson(key);
        if (cached) return cached;

        const whereDate = Prisma.sql`
      ${from ? Prisma.sql` AND t."date" >= ${new Date(from)}` : Prisma.empty}
      ${to ? Prisma.sql` AND t."date" <= ${new Date(to)}` : Prisma.empty}
    `;

        const rows = await this.prisma.$queryRaw<
            { categoryId: string | null; categoryName: string | null; spend: number }[]
        >(Prisma.sql`
      SELECT
        t."categoryId" as "categoryId",
        c."name"       as "categoryName",
        SUM(CASE WHEN t."amount" < 0 THEN -t."amount" ELSE 0 END)::numeric AS "spend"
      FROM "Transaction" t
      LEFT JOIN "Category" c ON c.id = t."categoryId"
      WHERE t."userId" = ${userId}
      ${whereDate}
      GROUP BY t."categoryId", c."name"
      HAVING SUM(CASE WHEN t."amount" < 0 THEN -t."amount" ELSE 0 END) <> 0
      ORDER BY "spend" DESC
    `);

        await this.cache.setJson(key, rows);
        return rows;
    }

    @Get("monthly-trend")
    async monthlyTrend(@CurrentUserId() userId: string, @Query("year") year?: string) {
        const y = parseInt(year || String(new Date().getUTCFullYear()), 10);
        const key = this.cache.key("analytics", userId, "monthly-trend", y);
        const cached = await this.cache.getJson(key);
        if (cached) return cached;

        const rows = await this.prisma.$queryRaw<
            { month: string; income: number; spend: number }[]
        >(Prisma.sql`
      SELECT
        to_char(date_trunc('month', t."date"), 'YYYY-MM') as month,
        SUM(CASE WHEN t."amount" > 0 THEN t."amount" ELSE 0 END)::numeric AS income,
        SUM(CASE WHEN t."amount" < 0 THEN -t."amount" ELSE 0 END)::numeric AS spend
      FROM "Transaction" t
      WHERE t."userId" = ${userId}
        AND EXTRACT(YEAR FROM t."date") = ${y}
      GROUP BY 1
      ORDER BY 1
    `);

        await this.cache.setJson(key, rows);
        return rows;
    }
}