import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [PrismaModule, MessageModule],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
