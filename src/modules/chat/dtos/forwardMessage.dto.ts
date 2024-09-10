import { ChatType } from '../infra/mongoose/schemas/chat-message'

export class ForwardMessageDto {
  senderId: string
  chatId: string
  messageId: string
  chatType: ChatType
}
