import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import * as fs from 'fs';
const csv = require('csv-parser');
const pdf = require('pdf-parse');

import { PrismaService } from '../prisma/prisma.service';

@Processor('documents')
export class DocumentProcessor extends WorkerHost {
    private readonly logger = new Logger(DocumentProcessor.name);

    constructor(
        private aiService: AiService,
        private prisma: PrismaService
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);
        const { path, mimetype, userId } = job.data;
        this.logger.log(`[DEBUG] Processing File Path: ${path}`);
        const stats = fs.statSync(path);
        this.logger.log(`[DEBUG] File Size: ${stats.size} bytes`);

        let textContent = '';

        try {
            if (mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel') {
                textContent = await this.parseCss(path);
            } else if (mimetype === 'application/pdf') {
                textContent = await this.parsePdf(path);
            } else {
                throw new Error('Unsupported file type');
            }

            this.logger.log(`Extracted text content (first 100 chars): ${textContent.substring(0, 100)}...`);

            // 1. Store/Vectorize Document
            this.logger.log('Calling aiService.storeDocument...');
            await this.aiService.storeDocument(textContent, { filename: path.split('/').pop(), originalPath: path });
            this.logger.log(`Document stored and vectorized.`);

            // 2. Extract Transactions via AI
            if (userId) {
                this.logger.log(`Extracting transactions for user ${userId}...`);
                const transactions = await this.aiService.extractTransactions(textContent);
                this.logger.log(`Extracted ${transactions.length} transactions from text.`);

                if (transactions.length > 0) {
                    await this.saveTransactions(userId, transactions);
                }
            } else {
                this.logger.warn('No userId provided in job. Skipping transaction extraction.');
            }

            // 3. Generate Summary
            this.logger.log('Calling aiService.ask for summary...');
            const summary = await this.aiService.ask(`Summarize this financial document: ${textContent.substring(0, 1000)}`);
            this.logger.log(`AI Summary: ${summary}`);

        } catch (error: any) {
            this.logger.error(`Failed to process document: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async saveTransactions(userId: string, transactions: any[]) {
        try {
            // Find or Create "Uploads" Account
            let account = await this.prisma.account.findFirst({
                where: { userId, name: 'Uploads' }
            });

            if (!account) {
                this.logger.log('Creating "Uploads" account for user...');
                account = await this.prisma.account.create({
                    data: {
                        userId,
                        name: 'Uploads',
                        type: 'CASH', // Default type
                        balance: 0
                    }
                });
            }

            let insertedCount = 0;
            for (const tx of transactions) {
                // Determine Category ID (Keep it simple for now, map name -> Category lookup)
                // For MVP, we might leave categoryId null or try to find one by name
                // Let's try to find category by name (insensitive)
                const categoryName = tx.category || 'Uncategorized';
                let category = await this.prisma.category.findFirst({
                    where: { userId, name: { equals: categoryName, mode: 'insensitive' } }
                });

                // If fallback needed
                if (!category) {
                    // create one or assign to 'Uncategorized' if we had one.
                    // For now, let's just create it on the fly or ignore.
                    // Let's create it to be helpful.
                    category = await this.prisma.category.create({
                        data: { userId, name: categoryName }
                    });
                }

                await this.prisma.transaction.create({
                    data: {
                        userId,
                        accountId: account.id,
                        date: new Date(tx.date || new Date()),
                        amount: tx.amount || 0,
                        description: tx.description || 'Imported Transaction',
                        categoryId: category.id,
                        hash: (await import('crypto')).randomUUID(), // Unique hash for now
                    }
                });
                insertedCount++;
            }
            this.logger.log(`Saved ${insertedCount} transactions to DB.`);
        } catch (e) {
            this.logger.error('Error saving extracted transactions', e);
        }
    }

    private async parseCss(filePath: string): Promise<string> {
        const results: any[] = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    this.logger.log(`Parsed ${results.length} rows from CSV.`);
                    resolve(JSON.stringify(results));
                })
                .on('error', (err) => reject(err));
        });
    }

    private async parsePdf(filePath: string): Promise<string> {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    }
}
