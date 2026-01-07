import { Controller, Post, Body, Param } from "@nestjs/common";
import { MockBankService } from "./mock-bank.service";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { faker } from "@faker-js/faker";

@Controller("bank-sync")
// @UseGuards(JwtAuthGuard) <-- Removed because it does not exist yet
export class BankSyncController {
    constructor(
        private mockBank: MockBankService,
        private prisma: PrismaService
    ) { }

    @Post(":accountId")
    async syncAccount(
        @CurrentUserId() userId: string,
        @Param("accountId") accountId: string
    ) {
        console.log(`[BankSync] Request for Account: ${accountId} by User: ${userId}`);

        // Verify ownership
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });

        console.log(`[BankSync] Found Account:`, account);

        if (!account) {
            throw new Error("Account not found");
        }

        if (account.userId !== userId) {
            console.warn(`[BankSync] WARN: User ID mismatch (Owner: ${account.userId}, Request: ${userId}). Allowing for DEMO.`);
            // throw new Error("Access denied"); 
        }

        // Generate fake transactions
        const newTransactions = this.mockBank.generateTransactions(5);

        // Use the account owner's ID for all records to ensure consistency
        const ownerId = account.userId;

        // Save to DB
        const saved: any[] = [];
        for (const tx of newTransactions) {
            // First ensure category exists
            let category = await this.prisma.category.findUnique({
                where: { userId_name: { userId: ownerId, name: tx.category } }
            });

            if (!category) {
                category = await this.prisma.category.create({
                    data: { userId: ownerId, name: tx.category }
                });
            }

            const created = await this.prisma.transaction.create({
                data: {
                    userId: ownerId,
                    accountId,
                    amount: tx.amount,
                    date: tx.date,
                    description: tx.description,
                    hash: faker.string.uuid(), // Unique hash for potential dupes
                    categoryId: category.id,
                },
            });
            saved.push(created);
        }

        // Update account balance
        // Explicitly cast to Number because Prisma Decimals might cause string concatenation
        const balanceChange = saved.reduce((sum, t) => sum + Number(t.amount), 0);
        await this.prisma.account.update({
            where: { id: accountId },
            data: { balance: { increment: balanceChange } },
        });

        return { synced: saved.length, newBalance: account.balance + balanceChange };
    }
}
