import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from 'src/chats/chats.module';
import { MessagesModule } from 'src/messages/message.module';

@Module({
    imports: [UsersModule, ChatModule, MessagesModule],
    providers: [EventGateway]
})
export class EventModule {}
