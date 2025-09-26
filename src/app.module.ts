import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [DatabaseModule, UsersModule, ConfigModule.forRoot(), AuthModule, EventModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
