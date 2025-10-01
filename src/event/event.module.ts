import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from 'src/chats/chats.module';

@Module({
    imports: [UsersModule, ChatModule],
    providers: [EventGateway]
})
export class EventModule {}
