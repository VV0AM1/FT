import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            // Use absolute path to ensure we find .env in CWD
            envFilePath: require('path').resolve(process.cwd(), '.env'),
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().default("development"),
                PORT: Joi.number().default(4000),
                DATABASE_URL: Joi.string().uri().required(),
                SMTP_HOST: Joi.string().required(),
                SMTP_PORT: Joi.number().default(587),
                SMTP_USER: Joi.string().required(),
                SMTP_PASS: Joi.string().required(),
            }),
        }),
    ],
})
export class AppConfigModule {
    constructor() {
        console.log('Current Working Directory:', process.cwd());
        console.log('Looking for .env at:', require('path').resolve(process.cwd(), '.env'));
    }
}