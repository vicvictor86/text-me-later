import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { PrivateChat } from '../infra/mongoose/schemas/private-chat'
import { FetchPrivateChatsByUserIdRepositoryDto } from '../dtos/fetch-private-chats-by-user-id-service.dto'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

export interface FindByUsersIdProps {
  user1Id: UniqueEntityId
  user2Id: UniqueEntityId
}

export abstract class PrivateChatsRepository {
  abstract create(privateChat: PrivateChat): Promise<PrivateChat>

  abstract save(privateChat: PrivateChat): Promise<void>

  abstract findById(id: UniqueEntityId): Promise<PrivateChat | null>
  abstract findByUsersId(
    usersId: FindByUsersIdProps,
  ): Promise<PrivateChat | null>

  abstract fetchByUserId(
    params: FetchPrivateChatsByUserIdRepositoryDto,
  ): Promise<PaginationResult<PrivateChat>>
}
