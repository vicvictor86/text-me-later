import { UsersRepository } from '@/modules/user/repositories/users-repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'
import { ChatAlreadyExistsError } from '../errors/chat-already-exists-error'
import { Injectable } from '@nestjs/common'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { ChatMessagesService } from './chat-messages.service'
import { ChatType } from '../infra/mongoose/schemas/chat-message'
import { makeObjectId } from '@/shared/database/repositories/object-id'
import { GroupChatsRepository } from '../repositories/group-chats-repository'

@Injectable()
export class GroupChatsService {
  constructor(
    private groupChatsRepository: GroupChatsRepository,
    private usersRepository: UsersRepository,
    private chatMessagesService: ChatMessagesService,
  ) {}

  async create({
    whoRequestingId,
    otherUserId,
    text,
  }: CreateGroupChatDto): Promise<GroupChat> {
    const userRequesting = await this.usersRepository.findById(whoRequestingId)

    if (!userRequesting) {
      throw new ResourceNotFoundError('Usuário')
    }

    const groupChatWithUsersAlreadyExists =
      await this.groupChatsRepository.findByUsersId({
        user1Id: whoRequestingId,
        user2Id: otherUserId,
      })

    if (groupChatWithUsersAlreadyExists) {
      throw new ChatAlreadyExistsError()
    }

    const user1 = await this.usersRepository.findById(whoRequestingId)

    if (!user1) {
      throw new ResourceNotFoundError('Usuário')
    }

    const user2 = await this.usersRepository.findById(otherUserId)

    if (!user2) {
      throw new ResourceNotFoundError('Usuário')
    }

    const whoRequestingIdObjectId = makeObjectId(whoRequestingId)
    const otherUserIdObjectId = makeObjectId(otherUserId)
    const groupChat = await this.groupChatsRepository.create(
      new GroupChat({
        user1Id: whoRequestingIdObjectId,
        user2Id: otherUserIdObjectId,
        titleUser1: user2.username,
        titleUser2: user1.username,
      }),
    )

    await this.chatMessagesService.create({
      chatId: groupChat._id.toString(),
      chatType: ChatType.PRIVATE,
      senderId: whoRequestingId,
      text,
      whoRequestingId,
    })

    return groupChat
  }

  async findById({
    whoRequestingId,
    chatId,
  }: FindGroupChatByIdServiceDto): Promise<{
    groupChat: GroupChat
  }> {
    const user = await this.usersRepository.findById(whoRequestingId)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    const groupChat = await this.groupChatsRepository.findById(chatId)

    if (!groupChat) {
      throw new ResourceNotFoundError('Chat')
    }

    if (
      whoRequestingId !== groupChat.user1Id.toString() &&
      whoRequestingId !== groupChat.user2Id.toString()
    ) {
      throw new NotAllowedError()
    }

    return { groupChat }
  }

  async fetchByUserId({
    paginationParams,
    userId,
  }: FetchGroupChatsByUserIdServiceDto): Promise<{
    groupChats: PaginationResult<GroupChat>
  }> {
    const user = await this.usersRepository.findById(userId)

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
