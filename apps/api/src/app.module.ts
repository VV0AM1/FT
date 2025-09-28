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
  ],
  providers: [BootstrapUserMiddleware],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BootstrapUserMiddleware).forRoutes("*");
  }
}