import { ChatType } from '../infra/mongoose/schemas/chat-message'

export class CreateChatMessageDto {
  senderId: string
  chatId: string
  text: string
  isForwarded?: boolean
  answeringTo?: string
  chatType: ChatType
}
