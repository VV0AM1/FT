import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe, Logger as NestLogger } from "@nestjs/common";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";


if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder().setTitle("API").setVersion("1.0").build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, doc);

  const port = app.get(ConfigService).get<number>("PORT", 4000);
  await app.listen(port, "0.0.0.0");
  const logger = new NestLogger("Bootstrap");
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();