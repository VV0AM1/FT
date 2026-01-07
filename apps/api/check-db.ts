require('dotenv').config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('Checking DB...');
    console.log('URL:', process.env.DATABASE_URL ? 'Defined (Starts with ' + process.env.DATABASE_URL.substring(0, 10) + '...)' : 'Undefined');

    try {
        // Create a test doc to verify write access
        const testDoc = await prisma.document.create({
            data: {
                content: "Test Document from check-db",
                metadata: { source: "check-db" }
            }
        });
        console.log('✅ Created test document with ID:', testDoc.id);

        const count = await prisma.document.count();
        console.log(`\n---------------------------------`);
        console.log(`Document Count in DB: ${count}`);
        console.log(`---------------------------------\n`);

        const lastDoc = await prisma.document.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        console.log('Last Document Content:', lastDoc?.content);

    } catch (error) {
        console.error('Error connecting/writing to DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
