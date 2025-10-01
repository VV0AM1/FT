import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { S3Module } from "../s3/s3.module";
import { ConnectionsController } from "./connections.controller";
import { ConnectionsService } from "./connections.service";
import { MockProviderService } from "./mock-provider.service";

@Module({
    imports: [PrismaModule, S3Module],
    controllers: [ConnectionsController],
    providers: [ConnectionsService, MockProviderService],
})
export class ConnectionsModule { }