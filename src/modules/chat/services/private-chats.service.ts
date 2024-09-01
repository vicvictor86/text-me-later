import { PrivateChatsRepository } from '../repositories/private-chats-repository'
import { PrivateChat } from '../infra/mongoose/schemas/private-chat'
import { UsersRepository } from '@/modules/user/repositories/users-repository'
import { CreatePrivateChatDto } from '../dtos/create-private-chat.dto'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'
import { ChatAlreadyExistsError } from '../errors/chat-already-exists-error'
import { Injectable } from '@nestjs/common'
import { FindPrivateChatByIdServiceDto } from '../dtos/find-private-chat-by-id.dto'
import { FetchPrivateChatsByUserIdServiceDto } from '../dtos/fetch-private-chats-by-user-id-service.dto'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { ChatMessagesService } from './chat-messages.service'
import { ChatType } from '../infra/mongoose/schemas/chat-message'
import { makeObjectId } from '@/shared/database/repositories/object-id'

@Injectable()
export class PrivateChatsService {
  constructor(
    private privateChatsRepository: PrivateChatsRepository,
    private usersRepository: UsersRepository,
    private chatMessagesService: ChatMessagesService,
  ) {}

  async create({
    whoRequestingId,
    otherUserId,
    text,
  }: CreatePrivateChatDto): Promise<PrivateChat> {
    const userRequesting = await this.usersRepository.findById(whoRequestingId)

    if (!userRequesting) {
      throw new ResourceNotFoundError('Usuário')
    }

    const privateChatWithUsersAlreadyExists =
      await this.privateChatsRepository.findByUsersId({
        user1Id: whoRequestingId,
        user2Id: otherUserId,
      })

    if (privateChatWithUsersAlreadyExists) {
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
    const privateChat = await this.privateChatsRepository.create(
      new PrivateChat({
        user1Id: whoRequestingIdObjectId,
        user2Id: otherUserIdObjectId,
        titleUser1: user2.username,
        titleUser2: user1.username,
      }),
    )

    await this.chatMessagesService.create({
      chatId: privateChat._id.toString(),
      chatType: ChatType.PRIVATE,
      senderId: whoRequestingId,
      text,
      whoRequestingId,
    })

    return privateChat
  }

  async findById({
    whoRequestingId,
    chatId,
  }: FindPrivateChatByIdServiceDto): Promise<{
    privateChat: PrivateChat
  }> {
    const user = await this.usersRepository.findById(whoRequestingId)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    const privateChat = await this.privateChatsRepository.findById(chatId)

    if (!privateChat) {
      throw new ResourceNotFoundError('Chat')
    }

    if (
      whoRequestingId !== privateChat.user1Id.toString() &&
      whoRequestingId !== privateChat.user2Id.toString()
    ) {
      throw new NotAllowedError()
    }

    return { privateChat }
  }

  async fetchByUserId({
    paginationParams,
    userId,
  }: FetchPrivateChatsByUserIdServiceDto): Promise<{
    privateChats: PaginationResult<PrivateChat>
  }> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    const privateChats = await this.privateChatsRepository.fetchByUserId({
      paginationParams,
      userId,
    })

    return { privateChats }
  }
}
