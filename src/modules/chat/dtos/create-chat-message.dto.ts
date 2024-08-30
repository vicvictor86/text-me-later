import { ChatType } from '../infra/mongoose/chat-message'

export class CreateChatMessageRepositoryDto {
  chatId: string
  chatName?: string
  chatDescription?: string
  senderId: string
  text: string
  chatType: ChatType
}

export class CreateChatMessageServiceDto extends CreateChatMessageRepositoryDto {
  whoRequestingId: string
}
