import { FetchGroupChatsByUserIdDto } from '@/modules/chat/dtos/fetch-group-chats-by-user-id.dto'
import { GroupChat } from '@/modules/chat/infra/mongoose/schemas/group-chat'
import { GroupChatsRepository } from '@/modules/chat/repositories/group-chats-repository'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

export class InMemoryGroupChatsRepository implements GroupChatsRepository {
  public items: GroupChat[] = []

  async create(groupChat: GroupChat): Promise<GroupChat> {
    this.items.push(groupChat)

    return groupChat
  }

  async findById(id: UniqueEntityId): Promise<GroupChat | null> {
    const groupChat = this.items.find(
      (item) => item._id.toString() === id.toString(),
    )

    return groupChat || null
  }

  async save(groupChat: GroupChat): Promise<void> {
    const index = this.items.findIndex(
      (item) => item._id.toString() === groupChat._id.toString(),
    )

    this.items[index] = groupChat
  }

  async fetchByUserId({
    paginationParams,
    userId,
  }: FetchGroupChatsByUserIdDto): Promise<PaginationResult<GroupChat>> {
    const { pageIndex, perPage, search } = paginationParams

    const userGroupChats = this.items.filter((item) =>
      item.members.find((member) => member._id.toString() === userId),
    )

    const allGroupChatsThatMatchWithSearch = userGroupChats.filter(
      (chatMessageInChat) => chatMessageInChat.name.includes(search || ''),
    )

    const allGroupChatsThatMatchWithSearchPaginated =
      allGroupChatsThatMatchWithSearch.slice(
        pageIndex * perPage,
        (pageIndex + 1) * perPage,
      )

    return {
      payload: allGroupChatsThatMatchWithSearchPaginated,
      meta: {
        totalCount: allGroupChatsThatMatchWithSearch.length,
        pageIndex,
        perPage,
      },
    }
  }
}
