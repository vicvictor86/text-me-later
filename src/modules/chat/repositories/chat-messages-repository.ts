import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { ChatMessage } from '../infra/mongoose/schemas/chat-message'
import { FetchMessagesByChatIdRepositoryDto } from '../dtos/fetch-messages-by-chat-id-service.dto'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

export abstract class ChatMessagesRepository {
  abstract create(chatMessage: ChatMessage): Promise<void>
  abstract save(chatMessage: ChatMessage): Promise<void>

  abstract findById(id: UniqueEntityId): Promise<ChatMessage | null>

  abstract fetchByChatId(
    params: FetchMessagesByChatIdRepositoryDto,
  ): Promise<PaginationResult<ChatMessage>>
}
