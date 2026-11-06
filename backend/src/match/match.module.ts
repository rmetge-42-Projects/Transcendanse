import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageModule } from '../message/message.module';

@Module({
imports: [PrismaModule, MessageModule],
controllers: [MatchController],
providers: [MatchService],
})
export class MatchModule {}
