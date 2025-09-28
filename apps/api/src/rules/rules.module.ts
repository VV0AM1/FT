import { Module } from "@nestjs/common";
import { RulesService } from "./rules.service";
import { RulesController } from "./rules.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    providers: [RulesService],
    controllers: [RulesController],
})
export class RulesModule { }