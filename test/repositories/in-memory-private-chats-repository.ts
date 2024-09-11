import { FetchPrivateChatsByUserIdRepositoryDto } from '@/modules/chat/dtos/fetch-private-chats-by-user-id-service.dto copy'
import { PrivateChat } from '@/modules/chat/infra/mongoose/schemas/private-chat'
import {
  FindByUsersIdProps,
  PrivateChatsRepository,
} from '@/modules/chat/repositories/private-chats-repository'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

export class InMemoryPrivateChatsRepository implements PrivateChatsRepository {
  public items: PrivateChat[] = []

  async create(privateChat: PrivateChat): Promise<PrivateChat> {
    this.items.push(privateChat)

    return privateChat
  }

  async findById(id: UniqueEntityId): Promise<PrivateChat | null> {
    const privateChat = this.items.find(
      (item) => item._id.toString() === id.toString(),
    )

    return privateChat || null
  }

  async save(privateChat: PrivateChat): Promise<void> {
    const index = this.items.findIndex(
      (item) => item._id.toString() === privateChat._id.toString(),
    )

    this.items[index] = privateChat
  }

  async fetchByUserId({
    paginationParams,
    userId,
  }: FetchPrivateChatsByUserIdRepositoryDto): Promise<
    PaginationResult<PrivateChat>
  > {
    const { pageIndex, perPage, search } = paginationParams

    const userPrivateChats = this.items.filter(
      (item) =>
        item.user1Id.toString() === userId.toString() ||
        item.user2Id.toString() === userId.toString(),
    )

    const allPrivateChatsThatMatchWithSearch = userPrivateChats.filter(
      (chatMessageInChat) => {
        const isUser1 =
          chatMessageInChat.user1Id.toString() === userId.toString()
        const isUser2 =
          chatMessageInChat.user2Id.toString() === userId.toString()

        return isUser1
          ? chatMessageInChat.titleUser1.includes(search || '')
          : isUser2 && chatMessageInChat.titleUser2.includes(search || '')
      },
    )

    const allPrivateChatsThatMatchWithSearchPaginated =
      allPrivateChatsThatMatchWithSearch.slice(
        pageIndex * perPage,
        (pageIndex + 1) * perPage,
      )

    return {
      payload: allPrivateChatsThatMatchWithSearchPaginated,
      meta: {
        totalCount: allPrivateChatsThatMatchWithSearch.length,
        pageIndex,
        perPage,
      },
    }
  }

  async findByUsersId({
    user1Id,
    user2Id,
  }: FindByUsersIdProps): Promise<PrivateChat | null> {
    const privateChat = this.items.find(
      (privateChat) =>
        (privateChat.user1Id.toString() === user1Id.toString() &&
          privateChat.user2Id.toString() === user2Id.toString()) ||
        (privateChat.user1Id.toString() === user2Id.toString() &&
          privateChat.user2Id.toString() === user1Id.toString()),
    )

    return privateChat || null
  }
}
