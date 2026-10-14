import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicApiController } from './public-api.controller';
import { PublicApiGuard } from './public-api.guard';
import { PublicApiService } from './public-api.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicApiController],
  providers: [PublicApiGuard, PublicApiService],
})
export class PublicApiModule {}
