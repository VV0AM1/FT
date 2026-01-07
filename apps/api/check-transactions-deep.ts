
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const transactions = await prisma.transaction.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
        });

        console.log(`Found ${transactions.length} recent transactions.`);

        // Safely log primitive values only to avoid circular json or buffer issues
        for (const t of transactions) {
            const date = t.date ? t.date.toISOString().split('T')[0] : 'N/A';
            const amount = t.amount ?? 0;
            const desc = (t.description || '').substring(0, 30);
            const uid = (t.userId || '').substring(0, 8);
            console.log(`[${date}] ${amount.toString().padEnd(10)} | ${desc} | User: ${uid}`);
        }
    } catch (error) {
        console.error("Error fetching transactions:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
