import { PaginationParams } from '@/shared/database/repositories/pagination-params'
import { ChatType } from '../infra/mongoose/chat-message'

export class FetchMessagesByChatIdRepositoryDto {
  chatId: string
  paginationParams: PaginationParams
}

export class FetchMessagesByChatIdServiceDto extends FetchMessagesByChatIdRepositoryDto {
  whoRequestingId: string
  chatType: ChatType
}
