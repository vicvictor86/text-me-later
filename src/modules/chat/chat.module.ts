import { Module } from '@nestjs/common'
import { CryptographyModule } from '@/shared/cryptography/infra/cryptography.module'
import { PrivateChatsService } from './services/private-chats.service'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { ChatMessagesService } from './services/chat-messages.service'
import { AuthModule } from '@/shared/auth/infra/auth.module'
import { PrivateChatWebSocketGateway } from './infra/websocket/private-chat-websocket.gateway'
import { GroupChatWebSocketGateway } from './infra/websocket/group-chat-websocket.gateway'
import { ChatMessagesWebSocketGateway } from './infra/websocket/chat-messages-websocket.gateway'
import { GroupChatsService } from './services/group-chats.service'

@Module({
  imports: [DatabaseModule, CryptographyModule, AuthModule],
  controllers: [],
  providers: [
    PrivateChatsService,
    ChatMessagesService,
    GroupChatsService,
    PrivateChatWebSocketGateway,
    GroupChatWebSocketGateway,
    ChatMessagesWebSocketGateway,
  ],
  exports: [
    PrivateChatsService,
    ChatMessagesService,
    GroupChatsService,
    PrivateChatWebSocketGateway,
    GroupChatWebSocketGateway,
    ChatMessagesWebSocketGateway,
  ],
})
export class ChatModule {}
