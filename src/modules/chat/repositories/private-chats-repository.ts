import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { PrivateChat } from '../infra/mongoose/schemas/private-chat'
import { FetchPrivateChatsByUserIdRepositoryDto } from '../dtos/fetch-private-chats-by-user-id-service.dto'

export interface FindByUsersIdProps {
  user1Id: string
  user2Id: string
}

export abstract class PrivateChatsRepository {
  abstract create(privateChat: PrivateChat): Promise<PrivateChat>

  abstract save(privateChat: PrivateChat): Promise<void>

  abstract findById(id: string): Promise<PrivateChat | null>
  abstract findByUsersId(
    usersId: FindByUsersIdProps,
  ): Promise<PrivateChat | null>

  abstract fetchByUserId(
    params: FetchPrivateChatsByUserIdRepositoryDto,
  ): Promise<PaginationResult<PrivateChat>>
}
