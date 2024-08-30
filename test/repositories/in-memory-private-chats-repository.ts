import { CreatePrivateChatRepositoryDto } from '@/modules/chat/dtos/create-private-chat.dto'
import { PrivateChat } from '@/modules/chat/infra/mongoose/private-chat'
import {
  FindByUsersIdProps,
  PrivateChatsRepository,
} from '@/modules/chat/repositories/private-chats-repository'
import { Types } from 'mongoose'

export class InMemoryPrivateChatsRepository implements PrivateChatsRepository {
  public items: PrivateChat[] = []

  async create(
    createPrivateChat: CreatePrivateChatRepositoryDto,
  ): Promise<PrivateChat> {
    const privateChat: PrivateChat = {
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      ...createPrivateChat,
    }

    this.items.push(privateChat)

    return privateChat
  }

  async findById(id: string): Promise<PrivateChat | null> {
    const PrivateChat = this.items.find(
      (PrivateChat) => PrivateChat._id.toString() === id,
    )

    return PrivateChat || null
  }

  async save(privateChat: PrivateChat): Promise<void> {
    const index = this.items.findIndex(
      (item) => item._id.toString() === privateChat._id.toString(),
    )

    this.items[index] = privateChat
  }

  async fetchByUserId(userId: string): Promise<PrivateChat[]> {
    return this.items.filter(
      (item) => item.user1Id === userId || item.user2Id === userId,
    )
  }

  async findByUsersId({
    user1Id,
    user2Id,
  }: FindByUsersIdProps): Promise<PrivateChat | null> {
    const privateChat = this.items.find(
      (privateChat) =>
        (privateChat.user1Id === user1Id && privateChat.user2Id === user2Id) ||
        (privateChat.user1Id === user2Id && privateChat.user2Id === user1Id),
    )

    return privateChat || null
  }
}
