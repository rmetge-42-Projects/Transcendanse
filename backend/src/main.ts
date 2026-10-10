import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    console.error('Required secrets were not loaded from Vault by the container entrypoint.');
    process.exit(1);
  }
  
const app = await NestFactory.create(AppModule);

app.use(json({ limit: '10mb' }));
app.use(urlencoded({ limit: '10mb', extended: true }));


  
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'https://transcendance42.fr:8443' });

app.useGlobalPipes(
	new ValidationPipe({
	whitelist: true,
	transform: true,
	}));
await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
