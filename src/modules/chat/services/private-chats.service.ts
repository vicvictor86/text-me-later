import { PrivateChatsRepository } from '../repositories/private-chats-repository'
import { PrivateChat } from '../infra/mongoose/private-chat'
import { UsersRepository } from '@/modules/user/repositories/users-repository'
import { CreatePrivateChatServiceDto } from '../dtos/create-private-chat.dto'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'
import { ChatAlreadyExistsError } from '../errors/chat-already-exists-error'
import { Injectable } from '@nestjs/common'
import { FindPrivateChatByIdServiceDto } from '../dtos/find-private-chat-by-id.dto'
import { FindPrivateChatByTitleServiceDto } from '../dtos/find-private-chat-by-title-service.dto'

@Injectable()
export class PrivateChatsService {
  constructor(
    private privateChatsRepository: PrivateChatsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async create({
    whoRequestingId,
    user1Id,
    user2Id,
  }: CreatePrivateChatServiceDto): Promise<void> {
    const userRequesting = await this.usersRepository.findById(whoRequestingId)

    if (!userRequesting) {
      throw new ResourceNotFoundError('Usuário')
    }

    if (whoRequestingId !== user1Id && whoRequestingId !== user2Id) {
      throw new NotAllowedError()
    }

    const privateChatWithUsersAlreadyExists =
      await this.privateChatsRepository.findByUsersId({ user1Id, user2Id })

    if (privateChatWithUsersAlreadyExists) {
      throw new ChatAlreadyExistsError()
    }

    const user1 = await this.usersRepository.findById(user1Id)

    if (!user1) {
      throw new ResourceNotFoundError('Usuário')
    }

    const user2 = await this.usersRepository.findById(user2Id)

    if (!user2) {
      throw new ResourceNotFoundError('Usuário')
    }

    await this.privateChatsRepository.create({
      user1Id,
      user2Id,
      titleUser1: user2.username,
      titleUser2: user1.username,
    })
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
      whoRequestingId !== privateChat.user1Id &&
      whoRequestingId !== privateChat.user2Id
    ) {
      throw new NotAllowedError()
    }

    return { privateChat }
  }

  async findByTitle({
    whoRequestingId,
    title,
  }: FindPrivateChatByTitleServiceDto): Promise<{
    privateChat: PrivateChat
  }> {
    const user = await this.usersRepository.findById(whoRequestingId)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    const privateChats =
      await this.privateChatsRepository.fetchByUserId(whoRequestingId)

    const privateChat = privateChats.find(
      (privateChat) =>
        (privateChat.user1Id === whoRequestingId &&
          privateChat.titleUser1 === title) ||
        (privateChat.user2Id === whoRequestingId &&
          privateChat.titleUser2 === title),
    )

    if (!privateChat) {
      throw new ResourceNotFoundError('Chat')
    }

    return { privateChat }
  }
}
