import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MatchModule } from './match/match.module';
import { MessageModule } from './message/message.module';
import { PublicApiModule } from './public-api/public-api.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MatchModule,
    MessageModule,
    PublicApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
