import { Module } from '@nestjs/common'
import { CryptographyModule } from '@/shared/cryptography/infra/cryptography.module'
import { PrivateChatsService } from './services/private-chats.service'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { ChatWebSocketGateway } from './infra/websocket/chat-websocket.gateway'
import { ChatMessagesService } from './services/chat-messages.service'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [],
  providers: [PrivateChatsService, ChatMessagesService, ChatWebSocketGateway],
  exports: [PrivateChatsService, ChatMessagesService, ChatWebSocketGateway],
})
export class ChatModule {}
