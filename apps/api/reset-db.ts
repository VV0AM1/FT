
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Clearing All Transactions ---');
    const deleteDocs = await prisma.document.deleteMany({});
    const deleteTx = await prisma.transaction.deleteMany({});
    console.log(`Deleted ${deleteTx.count} transactions and ${deleteDocs.count} documents.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
