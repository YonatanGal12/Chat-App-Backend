import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { DatabaseModule } from 'src/database/database.module'

@Module({
  imports: [DatabaseModule],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
