import { CreateChatMessageRepositoryDto } from '@/modules/chat/dtos/create-chat-message.dto'
import { FetchMessagesByChatIdServiceDto } from '@/modules/chat/dtos/fetch-messages-by-chat-id-service.dto'
import { ChatMessage } from '@/modules/chat/infra/mongoose/chat-message'
import { ChatMessagesRepository } from '@/modules/chat/repositories/chat-messages-repository'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { Types } from 'mongoose'

export class InMemoryChatMessagesRepository implements ChatMessagesRepository {
  public items: ChatMessage[] = []

  async create(
    createChatMessage: CreateChatMessageRepositoryDto,
  ): Promise<void> {
    const chatMessage: ChatMessage = {
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      ...createChatMessage,
    }

    this.items.push(chatMessage)
  }

  async findById(id: string): Promise<ChatMessage | null> {
    const ChatMessage = this.items.find(
      (ChatMessage) => ChatMessage._id.toString() === id,
    )

    return ChatMessage || null
  }

  async save(chatMessage: ChatMessage): Promise<void> {
    const index = this.items.findIndex(
      (item) => item._id.toString() === chatMessage._id.toString(),
    )

    this.items[index] = chatMessage
  }

  async fetchByChatId({
    chatId,
    paginationParams,
  }: FetchMessagesByChatIdServiceDto): Promise<PaginationResult<ChatMessage>> {
    const { pageIndex, perPage, search } = paginationParams

    const chatMessagesInChat = this.items.filter(
      (item) => item.chatId === chatId,
    )

    const allChatMessagesThatMatchWithSearch = chatMessagesInChat.filter(
      (chatMessageInChat) => chatMessageInChat.text.includes(search || ''),
    )

    const allChatMessagesThatMatchWithSearchPaginated =
      allChatMessagesThatMatchWithSearch.slice(
        pageIndex * perPage,
        (pageIndex + 1) * perPage,
      )

    return {
      payload: allChatMessagesThatMatchWithSearchPaginated,
      meta: {
        totalCount: allChatMessagesThatMatchWithSearch.length,
        pageIndex,
        perPage,
      },
    }
  }
}
