import { PaginationParams } from '@/shared/database/repositories/pagination-params'

export class FetchPrivateChatsByUserIdRepositoryDto {
  userId: string
  paginationParams: PaginationParams
}

export class FetchPrivateChatsByUserIdServiceDto extends FetchPrivateChatsByUserIdRepositoryDto {}
