import { Types } from 'mongoose'
import { faker } from '@faker-js/faker'
import {
  ChatMessage,
  ChatType,
} from '@/modules/chat/infra/mongoose/chat-message'
import { CreateChatMessageRepositoryDto } from '@/modules/chat/dtos/create-chat-message.dto'

export function makeChatMessage(
  override: Partial<CreateChatMessageRepositoryDto> = {},
  id?: string,
) {
  const chatMessage: ChatMessage = {
    _id: id ? new Types.ObjectId(id) : new Types.ObjectId(),
    chatId: new Types.ObjectId().toString(),
    senderId: new Types.ObjectId().toString(),
    text: faker.lorem.sentence(),
    chatType: ChatType.PRIVATE,
    createdAt: new Date(),
    ...override,
  }

  return chatMessage
}

// @Injectable()
// export class ChatMessageFactory {
//   constructor(
//     @InjectModel(ChatMessage.name) private chatmessageModel: Model<ChatMessage>,
//   ) {}

//   async makeMongoChatMessage(data: Partial<CreateChatMessageDto> = {}) {
//     const chatmessage = makeChatMessage(data)

//     await this.chatmessageModel.create({
//       ...chatmessage,
//     })

//     return chatmessage
//   }
// }
