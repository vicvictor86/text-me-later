import { CreatePrivateChatResponseDto } from '@/modules/chat/dtos/create-private-chat-response.dto'
import { PrivateChat } from '../../mongoose/schemas/private-chat'

export class PrivateChatPresenter {
  static toHTTP(
    privateChat: PrivateChat,
    userId: string,
  ): CreatePrivateChatResponseDto {
    const title =
      privateChat.user1Id.toString() === userId
        ? privateChat.titleUser1
        : privateChat.titleUser2

    const talkingUserId =
      privateChat.user1Id.toString() === userId
        ? privateChat.user2Id.toString()
        : privateChat.user1Id.toString()

    return {
      chatId: privateChat._id.toString(),
      title,
      userId,
      talkingUserId,
      createdAt: privateChat.createdAt,
      updatedAt: privateChat.updatedAt,
    }
  }
}
