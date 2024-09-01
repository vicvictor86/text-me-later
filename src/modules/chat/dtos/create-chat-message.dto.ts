import { ChatType } from '../infra/mongoose/schemas/chat-message'

export class CreateChatMessageDto {
  whoRequestingId: string
  senderId: string
  chatId: string
  text: string
  chatType: ChatType
}
