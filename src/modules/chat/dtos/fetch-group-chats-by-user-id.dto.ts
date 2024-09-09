import { PaginationParams } from '@/shared/database/repositories/pagination-params'

export class FetchGroupChatsByUserIdDto {
  userId: string
  paginationParams: PaginationParams
}
