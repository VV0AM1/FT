import { Global, Module, OnModuleDestroy, Inject, Optional } from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { processImport } from "./imports.worker";

export const NOTIFICATIONS_QUEUE_TOKEN = "NOTIFICATIONS_QUEUE";
export const NOTIFICATIONS_QUEUE_NAME = "notifications";
export const IMPORTS_QUEUE_TOKEN = "IMPORTS_QUEUE";
export const IMPORTS_QUEUE_NAME = "imports";

@Global()
@Module({
    providers: [
        {
            provide: "BULLMQ_CONNECTION",
            useFactory: () => {
                const disabled = process.env.NODE_ENV === "test" || process.env.DISABLE_WORKER === "1";
                if (disabled) return null as any;
                return new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
                    maxRetriesPerRequest: null,
                    enableReadyCheck: false,
                });
            },
        },
        {
            provide: IMPORTS_QUEUE_TOKEN,
            useFactory: (connection: Redis | null) => {
                if (!connection) return { add: async () => { } } as unknown as Queue;
                return new Queue(IMPORTS_QUEUE_NAME, { connection });
            },
            inject: ["BULLMQ_CONNECTION"],
        },
        {
            provide: NOTIFICATIONS_QUEUE_TOKEN,
            useFactory: (connection: Redis | null) => {
                if (!connection) return { add: async () => { } } as unknown as Queue;
                return new Queue(NOTIFICATIONS_QUEUE_NAME, { connection });
            },
            inject: ["BULLMQ_CONNECTION"],
        },
        // keep your workers and cleanup (see extra notes below)
    ],
    exports: ["BULLMQ_CONNECTION", IMPORTS_QUEUE_TOKEN, NOTIFICATIONS_QUEUE_TOKEN],
})
export class QueueModule { }