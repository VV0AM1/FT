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
import { BankSyncModule } from "./bank-sync/bank-sync.module";
import { ImportsModule } from "./imports/imports.module";
import { QueueModule } from "./queue/queue.module";
import { S3Module } from "./s3/s3.module";
import { TransactionsModule } from "./transactions/transactions.module"
import { CacheModule } from "./cache";
import { AnalyticsModule } from "./analytics/analytics.module";
import { ConnectionsModule } from "./connections/connections.module"
import { BudgetsModule } from "./budgets/budgets.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AiModule } from "./ai/ai.module";
import { DocumentsModule } from "./documents/documents.module";
import { ChatModule } from "./chat/chat.module";
import { AuthModule } from "./auth/auth.module";
import { MailModule } from "./mail/mail.module";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";

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
    BankSyncModule,
    S3Module,
    QueueModule,
    ImportsModule,
    TransactionsModule,
    CacheModule,
    AnalyticsModule,
    ConnectionsModule,
    BudgetsModule,
    NotificationsModule,
    AiModule,
    DocumentsModule,
    ChatModule,
    MailModule,
    AuthModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get('REDIS_URL'),
        },
      }),
    }),
  ],
  providers: [BootstrapUserMiddleware],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BootstrapUserMiddleware).forRoutes("*");
  }
}