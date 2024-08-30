import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { ChatMessage } from '../infra/mongoose/chat-message'
import { CreateChatMessageRepositoryDto } from '../dtos/create-chat-message.dto'
import { FetchMessagesByChatIdRepositoryDto } from '../dtos/fetch-messages-by-chat-id-service.dto'

export abstract class ChatMessagesRepository {
  abstract create(chatMessage: CreateChatMessageRepositoryDto): Promise<void>
  abstract save(chatMessage: ChatMessage): Promise<void>

  abstract findById(id: string): Promise<ChatMessage | null>

  abstract fetchByChatId(
    chatId: FetchMessagesByChatIdRepositoryDto,
  ): Promise<PaginationResult<ChatMessage>>
}
