import {
  ChatMessage,
  ChatMessageSchema,
} from '@/modules/chat/infra/mongoose/schemas/chat-message'
import {
  PrivateChat,
  PrivateChatSchema,
} from '@/modules/chat/infra/mongoose/schemas/private-chat'
import { ChatMessagesRepository } from '@/modules/chat/repositories/chat-messages-repository'
import { PrivateChatsRepository } from '@/modules/chat/repositories/private-chats-repository'
import { User, UserSchema } from '@/modules/user/infra/mongoose/schemas/user'
import { MongoChatMessagesRepository } from '@/modules/chat/infra/mongoose/repositories/mongo-chat-messages-repository'
import { MongoPrivateChatsRepository } from '@/modules/chat/infra/mongoose/repositories/mongo-private-chats-repository'
import { MongoUsersRepository } from '@/modules/user/infra/mongoose/repositories/mongo-users-repository'
import { UsersRepository } from '@/modules/user/repositories/users-repository'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  GroupChat,
  GroupChatSchema,
} from '@/modules/chat/infra/mongoose/schemas/group-chat'
import { GroupChatsRepository } from '@/modules/chat/repositories/group-chats-repository'
import { MongoGroupChatsRepository } from '@/modules/chat/infra/mongoose/repositories/mongo-group-chats-repository'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: ChatMessage.name,
        schema: ChatMessageSchema,
      },
      {
        name: PrivateChat.name,
        schema: PrivateChatSchema,
      },
      {
        name: GroupChat.name,
        schema: GroupChatSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: UsersRepository,
      useClass: MongoUsersRepository,
    },
    {
      provide: ChatMessagesRepository,
      useClass: MongoChatMessagesRepository,
    },
    {
      provide: PrivateChatsRepository,
      useClass: MongoPrivateChatsRepository,
    },
    {
      provide: GroupChatsRepository,
      useClass: MongoGroupChatsRepository,
    },
  ],
  exports: [
    MongooseModule,
    UsersRepository,
    ChatMessagesRepository,
    PrivateChatsRepository,
    GroupChatsRepository,
  ],
})
export class DatabaseModule {}
