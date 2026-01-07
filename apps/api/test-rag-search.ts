import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY missing");
        return;
    }

    const vectorStore = PrismaVectorStore.withModel(prisma).create(
        new GoogleGenerativeAIEmbeddings({
            apiKey: apiKey,
            model: "text-embedding-004",
        }),
        {
            prisma: Prisma,
            tableName: "Document",
            vectorColumnName: "embedding",
            columns: {
                id: PrismaVectorStore.IdColumn,
                content: PrismaVectorStore.ContentColumn,
            },
        }
    );

    const query = "total";
    console.log(`Searching for: ${query}`);
    const results = await vectorStore.similaritySearch(query, 3);

    console.log(`Found ${results.length} results:`);
    results.forEach((r, i) => {
        console.log(`[${i}] Content Preview: ${r.pageContent.substring(0, 200)}...`);
        console.log(`[${i}] Metadata:`, r.metadata);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
