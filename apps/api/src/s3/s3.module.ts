import { Module } from "@nestjs/common";
import { S3Client } from "@aws-sdk/client-s3";

@Module({
    providers: [
        {
            provide: S3Client,
            useFactory: () =>
                new S3Client({
                    region: process.env.S3_REGION ?? "us-east-1",
                    endpoint: process.env.S3_ENDPOINT,
                    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
                    credentials: { accessKeyId: "test", secretAccessKey: "test" },
                }),
        },
    ],
    exports: [S3Client],
})
export class S3Module { }