import { PaginationParams } from '@/shared/database/repositories/pagination-params'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

export class FetchPrivateChatsByUserIdRepositoryDto {
  userId: UniqueEntityId
  paginationParams: PaginationParams
}

export class FetchPrivateChatsByUserIdServiceDto {
  userId: string
  paginationParams: PaginationParams
}
