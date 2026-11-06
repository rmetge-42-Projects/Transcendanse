import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET || !process.env.PUBLIC_API_KEY) {
    console.error(
      "Required secrets were not loaded from Vault by the container entrypoint.",
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : true;

  app.enableCors({ origin: corsOrigin });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();
