import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { PrismaService } from '../prisma/prisma.service';
import { Document } from "@langchain/core/documents";
import { Prisma } from '@prisma/client';

@Injectable()
export class AiService {
    private chatModel: ChatGoogleGenerativeAI;
    private vectorStore: PrismaVectorStore<any, any, any, any>;
    private isMockMode = false;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');

        if (!apiKey || apiKey === '') {
            console.warn('⚠️  GEMINI_API_KEY not found. Switching to MOCK MODE.');
            this.isMockMode = true;
            return;
        }

        this.chatModel = new ChatGoogleGenerativeAI({
            apiKey: apiKey,
            model: "gemini-2.0-flash-001",
            maxOutputTokens: 2048,
        });

        this.vectorStore = PrismaVectorStore.withModel(this.prisma).create(
            new GoogleGenerativeAIEmbeddings({
                apiKey: apiKey,
                model: "models/text-embedding-004",
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
    }

    async ask(question: string, context?: string): Promise<string> {
        if (this.isMockMode) {
            return "I am a helpful AI (Mock Mode). I received your question: " + question;
        }

        // 1. Search for relevant context if not provided
        if (!context) {
            console.log(`🔍 Searching vector store for: "${question}"`);
            const results = await this.vectorStore.similaritySearch(question, 3);
            console.log(`✅ Found ${results.length} relevant documents.`);
            context = results.map(r => r.pageContent).join('\n\n');
            console.log(`📝 Context preview: ${context.substring(0, 100)}...`);
        }

        // Define Tools
        const categorizeTool = {
            name: "categorize_transaction",
            description: "Categorize a transaction based on description and amount",
            parameters: { // Gemini uses 'parameters' instead of 'schema' sometimes, but standard tool definition should work.
                // LangChain Google adapter expects Zod or standard JSON schema.
                type: "object",
                properties: {
                    description: { type: "string" },
                    amount: { type: "number" },
                    category: { type: "string", enum: ["Food", "Transport", "Utilities", "Entertainment", "Other"] }
                },
                required: ["description", "amount", "category"]
            }
        };

        // Bind tools to model
        // const modelWithTools = this.chatModel.bindTools([categorizeTool]);

        const messages = [
            new SystemMessage(`You are a helpful financial assistant. The user has provided financial data below as context (potentially in JSON or CSV format).
      
      INSTRUCTIONS:
      1. You MUST use the provided Context to answer the user's question.
      2. If the context contains raw data (like a list of transactions), parse it and perform any requested calculations (e.g., totals, averages).
      3. Do NOT refuse to answer based on "external files" - this data is provided directly to you here.
      
      Context:
      ${context}`),
            new HumanMessage(question)
        ];

        // invoke model with tools
        try {
            const response = await this.chatModel.invoke(messages);

            // Check if tool called
            if (response.tool_calls && response.tool_calls.length > 0) {
                // In a real agent loop, we would execute the tool and feed back the result.
                // For this simple example, we return the tool call details.
                return JSON.stringify(response.tool_calls);
            }

            return response.content as string;
        } catch (error: any) {
            console.error("❌ Gemini API Error:", error.message);
            if (error.message.includes("429") || error.message.includes("quota")) {
                return "I'm currently receiving too many requests (Rate Limit Exceeded). Please try again in a minute.";
            }
            return "I encountered an error processing your request.";
        }
    }

    async storeDocument(content: string, metadata: any = {}) {
        if (this.isMockMode) {
            console.log('Mock Mode: Skipping vector storage for document.');
            return;
        }

        try {
            console.log(`Generating embedding for document (${content.length} chars)...`);
            // We need to access the embeddings model. Since it's hidden in vectorStore, let's create a temporary one or refactor.
            // Better: Store embeddings instance in the class.

            // Re-instantiate for safety/clarity in this fix
            const embeddingsModel = new GoogleGenerativeAIEmbeddings({
                apiKey: this.configService.get<string>('GEMINI_API_KEY'),
                model: "models/text-embedding-004",
            });

            const vector = await embeddingsModel.embedQuery(content);
            console.log(`Generated vector of length ${vector.length}`);

            // Raw Insert to ensure vector is saved
            const id = (await import('crypto')).randomUUID();
            await this.prisma.$executeRaw`
                INSERT INTO "Document" (id, content, metadata, embedding, "createdAt", "updatedAt")
                VALUES (${id}, ${content}, ${metadata}, ${JSON.stringify(vector)}::vector, NOW(), NOW())
            `;

            console.log(`Successfully inserted document ${id} with embedding.`);

        } catch (error) {
            console.error('❌ Error adding document to Vector Store:', error);
            throw error;
        }
    }
    async extractTransactions(text: string): Promise<any[]> {
        if (this.isMockMode) {
            return [
                { date: new Date().toISOString(), amount: 100.00, description: "Mock Transaction", category: "Uncategorized" }
            ];
        }

        const prompt = `
        Analyze the following text and extract EVERY SINGLE financial transaction.
        - Do NOT summarize.
        - Do NOT skip any rows.
        - Map "Income" type to positive amounts, "Expense" type to negative amounts.
        - Return ONLY a raw JSON array.
        
        Each object in the array must have:
        - date (ISO 8601 string, e.g. "2023-12-31")
        - amount (number)
        - description (string)
        - category (suggest a category like "Food", "Transport", "Utilities", "Income", "Transfer", "Shopping", "Entertainment", "Other")

        Text to analyze:
        ${text.substring(0, 15000)}
        `;

        try {
            const response = await this.chatModel.invoke([new HumanMessage(prompt)]);
            let content = response.content as string;

            // Cleanup standard markdown code blocks if present
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();

            const transactions = JSON.parse(content);
            if (!Array.isArray(transactions)) {
                throw new Error("AI did not return an array");
            }
            return transactions;
        } catch (error) {
            console.error("❌ Error extracting transactions:", error);
            return [];
        }
    }
}
