import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

describe('Mandatory Transcendence Requirements (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should serve the Privacy Policy to avoid project rejection', () => {
    // Change this route to match your actual frontend/backend URL for the policy
    return request(app.getHttpServer())
      .get('/api/privacy-policy') 
      .expect(200);
  });
  
  it('should serve the Terms of Service', () => {
    // Change this route to match your actual frontend/backend URL for the terms
    return request(app.getHttpServer())
      .get('/api/terms-of-service') 
      .expect(200);
  });
});
