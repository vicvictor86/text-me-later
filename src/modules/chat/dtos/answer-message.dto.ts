import { ChatType } from '../infra/mongoose/schemas/chat-message'

export class AnswerMessageDto {
  senderId: string
  messageId: string
  chatType: ChatType
  text: string
}
