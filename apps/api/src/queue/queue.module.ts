import { Global, Module, OnModuleDestroy, Inject, Optional } from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";                  // ⬅️ use default export class
import { processImport } from "./imports.worker";

export const IMPORTS_QUEUE = "imports";

@Global()
@Module({
    providers: [
        {
            provide: "BULLMQ_CONNECTION",
            useFactory: () => {
                const disabled = process.env.NODE_ENV === "test" || process.env.DISABLE_WORKER === "1";
                if (disabled) return null as unknown as Redis;
                return new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { // ⬅️ new Redis(...)
                    maxRetriesPerRequest: null,
                    enableReadyCheck: false,
                });
            },
        },
        {
            provide: "IMPORTS_QUEUE",
            useFactory: (connection: Redis | null) => {
                if (!connection) {
                    // No-op queue for tests
                    return { add: async () => { } } as unknown as Queue;
                }
                return new Queue(IMPORTS_QUEUE, { connection });
            },
            inject: ["BULLMQ_CONNECTION"],
        },
        {
            provide: "IMPORTS_WORKER",
            useFactory: (connection: Redis | null) => {
                if (!connection) return null as unknown as Worker;
                return new Worker(
                    IMPORTS_QUEUE,
                    async (job) => {
                        console.log("[worker] import job", job.id, job.data);
                        await processImport(job.data);
                    },
                    { connection }
                );
            },
            inject: ["BULLMQ_CONNECTION"],
        },
        {
            provide: "BULLMQ_CLEANUP",
            useFactory: (connection: Redis | null, worker: Worker | null, queue: Queue | null) => {
                return {
                    async close() {
                        try { if (worker) await worker.close(); } catch { }
                        try { if (queue) await queue.close(); } catch { }
                        try { if (connection) connection.disconnect(); } catch { }   // ⬅️ just call disconnect()
                    },
                };
            },
            inject: ["BULLMQ_CONNECTION", "IMPORTS_WORKER", "IMPORTS_QUEUE"],
        },
    ],
    exports: ["BULLMQ_CONNECTION", "IMPORTS_QUEUE"],
})
export class QueueModule implements OnModuleDestroy {
    constructor(@Optional() @Inject("BULLMQ_CLEANUP") private cleanup?: { close(): Promise<void> }) { }
    async onModuleDestroy() {
        if (this.cleanup) await this.cleanup.close();
    }
}