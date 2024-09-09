import { FetchMessagesByChatIdServiceDto } from '@/modules/chat/dtos/fetch-messages-by-chat-id-service.dto'
import { ChatMessage } from '@/modules/chat/infra/mongoose/schemas/chat-message'
import { ChatMessagesRepository } from '@/modules/chat/repositories/chat-messages-repository'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

export class InMemoryChatMessagesRepository implements ChatMessagesRepository {
  public items: ChatMessage[] = []

  async create(chatMessage: ChatMessage): Promise<void> {
    this.items.push(chatMessage)
  }

  async findById(id: UniqueEntityId): Promise<ChatMessage | null> {
    const ChatMessage = this.items.find(
      (ChatMessage) => ChatMessage._id.toString() === id.toString(),
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
      (item) => item.chatId.toString() === chatId,
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
