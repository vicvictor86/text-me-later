import { Injectable } from '@nestjs/common'
import { UsersRepository } from '@/modules/user/repositories/users-repository'
import { ChatMessagesRepository } from '../repositories/chat-messages-repository'
import { PrivateChatsRepository } from '../repositories/private-chats-repository'
import { ChatMessage, ChatType } from '../infra/mongoose/schemas/chat-message'
import { FetchMessagesByChatIdServiceDto } from '../dtos/fetch-messages-by-chat-id-service.dto'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { CreateChatMessageDto } from '../dtos/create-chat-message.dto'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

@Injectable()
export class ChatMessagesService {
  constructor(
    private chatMessagesRepository: ChatMessagesRepository,
    private privateChatsRepository: PrivateChatsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async create({
    senderId,
    chatType,
    chatId,
    text,
  }: CreateChatMessageDto): Promise<void> {
    const chatIdUEID = new UniqueEntityId(chatId)
    const senderIdUEID = new UniqueEntityId(senderId)

    const user = await this.usersRepository.findById(senderIdUEID)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    const isPrivateChat = chatType === ChatType.PRIVATE

    if (isPrivateChat) {
      const privateChat = await this.privateChatsRepository.findById(chatIdUEID)

      if (!privateChat) {
        throw new ResourceNotFoundError('Chat')
      }

      if (
        senderId !== privateChat.user1Id.toString() &&
        senderId !== privateChat.user2Id.toString()
      ) {
        throw new NotAllowedError()
      }
    }

    await this.chatMessagesRepository.create(
      new ChatMessage({
        chatId: chatIdUEID.toObjectId(),
        senderId: senderIdUEID.toObjectId(),
        text,
        chatType,
      }),
    )
  }

  async fetchByChatId({
    whoRequestingId,
    chatId,
    chatType,
    paginationParams,
  }: FetchMessagesByChatIdServiceDto): Promise<PaginationResult<ChatMessage>> {
    const whoRequestingIdUEID = new UniqueEntityId(whoRequestingId)
    const chatIdUEID = new UniqueEntityId(chatId)

    const user = await this.usersRepository.findById(whoRequestingIdUEID)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    if (chatType === ChatType.PRIVATE) {
      const privateChat = await this.privateChatsRepository.findById(chatIdUEID)

      if (!privateChat) {
        throw new ResourceNotFoundError('Chat')
      }

      if (
        whoRequestingId !== privateChat.user1Id.toString() &&
        whoRequestingId !== privateChat.user2Id.toString()
      ) {
        throw new NotAllowedError()
      }
    }

    const chatMessages = await this.chatMessagesRepository.fetchByChatId({
      chatId,
      paginationParams,
    })

    return chatMessages
  }
}
