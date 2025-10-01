import { Controller, Get, Query } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUserId } from "../auth/current-user-id.decorator";

@Controller("transactions")
export class TransactionsController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async list(
        @CurrentUserId() userId: string,
        @Query("cursor") cursor?: string,
        @Query("limit") limitStr?: string,
        @Query("from") from?: string,
        @Query("to") to?: string,
        @Query("accountId") accountId?: string,
        @Query("categoryId") categoryId?: string,
        @Query("q") q?: string
    ) {
        const take = Math.min(parseInt(limitStr || "50", 10) || 50, 200);

        const where: any = { userId };
        if (from || to) where.date = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };
        if (accountId) where.accountId = accountId;
        if (categoryId) where.categoryId = categoryId;
        if (q) where.description = { contains: q, mode: "insensitive" };

        const items = await this.prisma.transaction.findMany({
            where,
            orderBy: [{ date: "desc" }, { id: "desc" }],
            take: take + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: { category: true, account: true },
        });

        const nextCursor = items.length > take ? items[take].id : null;
        return { items: items.slice(0, take), nextCursor };
    }
}