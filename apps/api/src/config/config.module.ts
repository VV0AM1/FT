import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ["apps/api/.env"],
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().default("development"),
                PORT: Joi.number().default(4000),
                DATABASE_URL: Joi.string().uri().required(),
            }),
        }),
    ],
})
export class AppConfigModule { }