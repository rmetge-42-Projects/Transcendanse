import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
	try {
    const token = fs.readFileSync('/vault/secrets/backend_token.txt', 'utf8').trim();

    const response = await fetch('http://vault:8200/v1/secret/data/backend', {
      headers: { 'X-Vault-Token': token }
    });

    if (!response.ok) throw new Error('Failed to fetch from Vault API');

    const vaultData = await response.json();

    process.env.DATABASE_URL = vaultData.data.data.database_url;
    process.env.JWT_SECRET = vaultData.data.data.jwt_secret;
    console.log("Vault secrets successfully injected.");
  } catch (error) {
    console.error("Vault integration error:", error.message);
    process.exit(1);
  }
const app = await NestFactory.create(AppModule);
app.enableCors();
app.useGlobalPipes(
	new ValidationPipe({
	whitelist: true,
	transform: true,
	}));
await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
