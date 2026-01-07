
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Recent Transactions ---');
    const transactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${transactions.length} recent transactions.`);
    // Log critical fields as JSON
    if (transactions.length > 0) {
        console.log(JSON.stringify(transactions.map(t => ({
            date: t.date,
            amount: t.amount,
            desc: t.description
        })), null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
