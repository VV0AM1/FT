import { Module, MiddlewareConsumer } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { TerminusModule } from "@nestjs/terminus";
import { AppConfigModule } from "./config/config.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { BootstrapUserMiddleware } from "./user/bootstrap.middleware";
import { CategoriesModule } from "./categories/categories.module";
import { RulesModule } from "./rules/rules.module";
import { AccountsModule } from "./accounts/accounts.module";
import { ImportsModule } from "./imports/imports.module";
import { QueueModule } from "./queue/queue.module";
import { S3Module } from "./s3/s3.module";
import { TransactionsModule } from "./transactions/transactions.module"
import { CacheModule } from "./cache";
import { AnalyticsModule } from "./analytics/analytics.module";
import { ConnectionsModule } from "./connections/connections.module"

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === "production" ? undefined : { target: "pino-pretty", options: { singleLine: false } },
      },
    }),
    TerminusModule,
    PrismaModule,
    HealthModule,
    CategoriesModule,
    RulesModule,
    AccountsModule,
    S3Module,
    QueueModule,
    ImportsModule,
    TransactionsModule,
    CacheModule,
    AnalyticsModule,
    ConnectionsModule
  ],
  providers: [BootstrapUserMiddleware],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BootstrapUserMiddleware).forRoutes("*");
  }
}