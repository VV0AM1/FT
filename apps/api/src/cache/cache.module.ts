import { Global, Module } from "@nestjs/common";
import { CacheService } from "./cache.service";

@Global()
@Module({
    providers: [
        { provide: "CACHE_TTL_SECONDS", useValue: 900 },
        CacheService,
    ],
    exports: [CacheService, "CACHE_TTL_SECONDS"],
})
export class CacheModule { }