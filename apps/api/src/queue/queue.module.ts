import { Global, Module, OnModuleDestroy, Inject, Optional } from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { processImport } from "./imports.worker";

export const IMPORTS_QUEUE = "imports";
export const NOTIFICATIONS_QUEUE = "notifications";

@Global()
@Module({
    providers: [
        {
            provide: "BULLMQ_CONNECTION",
            useFactory: () => {
                const disabled = process.env.NODE_ENV === "test" || process.env.DISABLE_WORKER === "1";
                if (disabled) return null as unknown as Redis;
                return new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
                    maxRetriesPerRequest: null,
                    enableReadyCheck: false,
                });
            },
        },

        {
            provide: "IMPORTS_QUEUE",
            useFactory: (connection: Redis | null) => {
                if (!connection) return { add: async () => { } } as unknown as Queue;
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
                    { connection },
                );
            },
            inject: ["BULLMQ_CONNECTION"],
        },

        {
            provide: "NOTIFICATIONS_QUEUE",
            useFactory: (connection: Redis | null) => {
                if (!connection) return { add: async () => { } } as unknown as Queue;
                return new Queue(NOTIFICATIONS_QUEUE, { connection });
            },
            inject: ["BULLMQ_CONNECTION"],
        },
        {
            provide: "NOTIFICATIONS_WORKER",
            useFactory: (connection: Redis | null) => {
                if (!connection) return null as unknown as Worker;
                return new Worker(
                    NOTIFICATIONS_QUEUE,
                    async (job) => {
                        const { sendNotificationJob } = await import("../notifications/notifications.worker.js");
                        await sendNotificationJob(job.data);
                    },
                    { connection },
                );
            },
            inject: ["BULLMQ_CONNECTION"],
        },

        {
            provide: "BULLMQ_CLEANUP",
            useFactory: (
                connection: Redis | null,
                importsWorker: Worker | null,
                importsQueue: Queue | null,
                notificationsWorker: Worker | null,
                notificationsQueue: Queue | null,
            ) => ({
                async close() {
                    try { if (importsWorker) await importsWorker.close(); } catch { }
                    try { if (notificationsWorker) await notificationsWorker.close(); } catch { }
                    try { if (importsQueue) await importsQueue.close(); } catch { }
                    try { if (notificationsQueue) await notificationsQueue.close(); } catch { }
                    try { if (connection) connection.disconnect(); } catch { }
                },
            }),
            inject: [
                "BULLMQ_CONNECTION",
                "IMPORTS_WORKER",
                "IMPORTS_QUEUE",
                "NOTIFICATIONS_WORKER",
                "NOTIFICATIONS_QUEUE",
            ],
        },
    ],
    exports: ["BULLMQ_CONNECTION", "IMPORTS_QUEUE", "NOTIFICATIONS_QUEUE"],
})
export class QueueModule implements OnModuleDestroy {
    constructor(@Optional() @Inject("BULLMQ_CLEANUP") private cleanup?: { close(): Promise<void> }) { }
    async onModuleDestroy() {
        if (this.cleanup) await this.cleanup.close();
    }
}
