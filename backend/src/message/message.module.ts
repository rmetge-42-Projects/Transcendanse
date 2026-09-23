import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway]
})
export class MessageModule {}