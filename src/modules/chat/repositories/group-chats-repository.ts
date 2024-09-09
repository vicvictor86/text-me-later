import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { GroupChat } from '../infra/mongoose/schemas/group-chat'
import { FetchGroupChatsByUserIdDto } from '../dtos/fetch-group-chats-by-user-id.dto'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

export interface FindByUsersIdProps {
  user1Id: UniqueEntityId
  user2Id: UniqueEntityId
}

export abstract class GroupChatsRepository {
  abstract create(groupChat: GroupChat): Promise<GroupChat>

  abstract save(groupChat: GroupChat): Promise<void>

  abstract findById(id: UniqueEntityId): Promise<GroupChat | null>
  abstract findByUsersId(usersId: FindByUsersIdProps): Promise<GroupChat | null>

  abstract fetchByUserId(
    params: FetchGroupChatsByUserIdDto,
  ): Promise<PaginationResult<GroupChat>>
}
