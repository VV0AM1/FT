import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
    "Income",
    "Groceries",
    "Rent",
    "Utilities",
    "Transport",
    "Dining",
    "Entertainment",
    "Healthcare",
    "Savings",
    "Other",
];

async function seedForUser(userId: string) {
    for (const name of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
            where: { userId_name: { userId, name } }, // requires @@unique([userId, name]) in schema (you have it)
            update: {},
            create: { userId, name },
        });
    }
}

async function main() {
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    for (const u of users) {
        console.log(`Seeding categories for ${u.email}`);
        await seedForUser(u.id);
    }
    console.log("Done");
}

main().finally(async () => prisma.$disconnect());