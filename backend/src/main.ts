import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import helmet from 'helmet';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          scriptSrc: [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net'], // for graphql playground
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 5. Lifecycle: Ensure graceful shutdown on container/process termination
  app.enableShutdownHooks();

  // 6. Execution: Bind to environment port or default fallback
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application successfully running in production on port: ${port}`);
}

bootstrap();