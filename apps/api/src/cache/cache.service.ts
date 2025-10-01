import { Inject, Injectable, Optional } from "@nestjs/common";
import type Redis from "ioredis";

@Injectable()
export class CacheService {
    private readonly ttl: number;
    constructor(
        @Optional() @Inject("BULLMQ_CONNECTION") private readonly redis: Redis | null,
        @Inject("CACHE_TTL_SECONDS") ttl: number,
    ) {
        this.ttl = ttl ?? 900;
    }

    key(...parts: (string | number | undefined | null)[]) {
        return parts.filter((p) => p !== undefined && p !== null).join(":");
    }

    async getJson<T = any>(key: string): Promise<T | null> {
        if (!this.redis) return null;
        try {
            const v = await this.redis.get(key);
            return v ? (JSON.parse(v) as T) : null;
        } catch {
            return null;
        }
    }

    async setJson(key: string, value: any): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.set(key, JSON.stringify(value), "EX", this.ttl);
        } catch {
        }
    }

    async delPattern(pattern: string): Promise<void> {
        if (!this.redis) return;
        let cursor = "0";
        do {
            const [next, keys] = await this.redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = next;
            if (keys.length) await this.redis.del(...keys);
        } while (cursor !== "0");
    }
}