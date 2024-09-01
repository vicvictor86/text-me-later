import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { ChatMessage } from '../infra/mongoose/schemas/chat-message'
import { FetchMessagesByChatIdRepositoryDto } from '../dtos/fetch-messages-by-chat-id-service.dto'

export abstract class ChatMessagesRepository {
  abstract create(chatMessage: ChatMessage): Promise<void>
  abstract save(chatMessage: ChatMessage): Promise<void>

  abstract findById(id: string): Promise<ChatMessage | null>

  abstract fetchByChatId(
    params: FetchMessagesByChatIdRepositoryDto,
  ): Promise<PaginationResult<ChatMessage>>
}
