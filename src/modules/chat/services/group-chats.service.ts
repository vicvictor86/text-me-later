import { UsersRepository } from '@/modules/user/repositories/users-repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { GroupChatsRepository } from '../repositories/group-chats-repository'
import { CreateGroupChatDto } from '../dtos/create-group-chat.dto'
import { GroupChat } from '../infra/mongoose/schemas/group-chat'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'
import { FindGroupChatByIdDto } from '../dtos/find-group-chat-by-id.dto'
import { FetchGroupChatsByUserIdDto } from '../dtos/fetch-group-chats-by-user-id.dto'

@Injectable()
export class GroupChatsService {
  constructor(
    private groupChatsRepository: GroupChatsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async create({
    whoRequestingId,
    members,
    name,
    description,
  }: CreateGroupChatDto): Promise<GroupChat> {
    const whoRequestingIdUEID = new UniqueEntityId(whoRequestingId)

    const userRequesting =
      await this.usersRepository.findById(whoRequestingIdUEID)

    if (!userRequesting) {
      throw new ResourceNotFoundError('Usuário')
    }

    const whoRequestingIsAMemberGroup = members.find(
      (member) => member === whoRequestingId,
    )

    if (!whoRequestingIsAMemberGroup) {
      members.push(whoRequestingId)
    }

    const membersUEID = members.map((memberId) => new UniqueEntityId(memberId))
    const membersObjectId = membersUEID.map((memberUEID) =>
      memberUEID.toObjectId(),
    )

    const allMembersExistsPromise = membersUEID.map(async (memberUEID) => {
      const member = await this.usersRepository.findById(memberUEID)

      if (!member) {
        throw new ResourceNotFoundError('Usuário')
      }
    })

    await Promise.all(allMembersExistsPromise)

    const groupChat = await this.groupChatsRepository.create(
      new GroupChat({
        name,
        members: membersObjectId,
        admins: [whoRequestingIdUEID.toObjectId()],
        description,
      }),
    )

    return groupChat
  }

  async findById({ whoRequestingId, chatId }: FindGroupChatByIdDto) {
    const whoRequestingIdUEID = new UniqueEntityId(whoRequestingId)
    const chatIdUEID = new UniqueEntityId(chatId)

    const user = await this.usersRepository.findById(whoRequestingIdUEID)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    const groupChat = await this.groupChatsRepository.findById(chatIdUEID)

    if (!groupChat) {
      throw new ResourceNotFoundError('Chat')
    }

    if (
      !groupChat.members.find((member) => member.toString() === whoRequestingId)
    ) {
      throw new NotAllowedError()
    }

    return { groupChat }
  }

  async fetchByUserId({
    paginationParams,
    userId,
  }: FetchGroupChatsByUserIdDto): Promise<{
    groupChats: PaginationResult<GroupChat>
  }> {
    const userIdUEID = new UniqueEntityId(userId)
    const user = await this.usersRepository.findById(userIdUEID)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    const groupChats = await this.groupChatsRepository.fetchByUserId({
      paginationParams,
      userId,
    })

    return { groupChats }
  }
}
