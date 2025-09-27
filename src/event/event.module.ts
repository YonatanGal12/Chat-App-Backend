import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [UsersModule],
    providers: [EventGateway]
})
export class EventModule {}
