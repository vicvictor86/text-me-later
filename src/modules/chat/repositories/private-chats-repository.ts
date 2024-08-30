import { CreatePrivateChatRepositoryDto } from '../dtos/create-private-chat.dto'
import { PrivateChat } from '../infra/mongoose/private-chat'

export interface FindByUsersIdProps {
  user1Id: string
  user2Id: string
}

export abstract class PrivateChatsRepository {
  abstract create(
    privateChat: CreatePrivateChatRepositoryDto,
  ): Promise<PrivateChat>

  abstract save(privateChat: PrivateChat): Promise<void>

  abstract findById(id: string): Promise<PrivateChat | null>
  abstract findByUsersId(
    usersId: FindByUsersIdProps,
  ): Promise<PrivateChat | null>

  abstract fetchByUserId(userId: string): Promise<PrivateChat[]>
}
