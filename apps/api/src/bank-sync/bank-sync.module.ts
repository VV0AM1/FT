import { Module } from "@nestjs/common";
import { BankSyncController } from "./bank-sync.controller";
import { MockBankService } from "./mock-bank.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [BankSyncController],
    providers: [MockBankService],
    exports: [MockBankService],
})
export class BankSyncModule { }
