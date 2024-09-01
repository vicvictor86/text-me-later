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
import { makeObjectId } from '@/shared/database/repositories/object-id'

@Injectable()
export class ChatMessagesService {
  constructor(
    private chatMessagesRepository: ChatMessagesRepository,
    private privateChatsRepository: PrivateChatsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async create({
    whoRequestingId,
    chatType,
    senderId,
    chatId,
    text,
  }: CreateChatMessageDto): Promise<void> {
    const user = await this.usersRepository.findById(whoRequestingId)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    if (whoRequestingId !== senderId) {
      throw new NotAllowedError()
    }

    const isPrivateChat = chatType === ChatType.PRIVATE

    if (isPrivateChat) {
      const privateChat = await this.privateChatsRepository.findById(chatId)

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

    const chatIdObjectId = makeObjectId(chatId)
    const senderIdObjectId = makeObjectId(senderId)

    await this.chatMessagesRepository.create(
      new ChatMessage({
        chatId: chatIdObjectId,
        senderId: senderIdObjectId,
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
    const user = await this.usersRepository.findById(whoRequestingId)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    if (chatType === ChatType.PRIVATE) {
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
    }

    const chatMessages = await this.chatMessagesRepository.fetchByChatId({
      chatId,
      paginationParams,
    })

    return chatMessages
  }
}
