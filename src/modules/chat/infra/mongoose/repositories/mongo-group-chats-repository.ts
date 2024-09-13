import { FetchGroupChatsByUserIdDto } from '@/modules/chat/dtos/fetch-group-chats-by-user-id.dto'
import { GroupChat } from '@/modules/chat/infra/mongoose/schemas/group-chat'
import { GroupChatsRepository } from '@/modules/chat/repositories/group-chats-repository'

import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class MongoGroupChatsRepository implements GroupChatsRepository {
  constructor(
    @InjectModel(GroupChat.name)
    private groupChatModel: Model<GroupChat>,
  ) {}

  async create(groupChat: GroupChat): Promise<GroupChat> {
    return await this.groupChatModel.create(groupChat)
  }

  async save(groupChat: GroupChat): Promise<void> {
    await this.groupChatModel.updateOne(
      {
        _id: groupChat._id,
      },
      {
        name: groupChat.name,
        description: groupChat.description,
        admins: groupChat.admins,
        members: groupChat.members,
        updatedAt: new Date(),
      },
    )
  }

  async findById(id: UniqueEntityId): Promise<GroupChat | null> {
    return this.groupChatModel
      .findOne({
        _id: id.toObjectId(),
      })
      .exec()
  }

  async fetchByUserId({
    paginationParams,
    userId,
  }: FetchGroupChatsByUserIdDto): Promise<PaginationResult<GroupChat>> {
    const { pageIndex, perPage, search } = paginationParams

    const groupChats = await this.groupChatModel
      .find(
        {
          name: { $regex: search || '', $options: 'i' },
          members: {
            $in: [userId],
          },
        },
        {},
        { limit: perPage, skip: pageIndex * perPage, sort: { createdAt: -1 } },
      )
      .exec()

    const totalCount = await this.groupChatModel.countDocuments({
      name: { $regex: search || '', $options: 'i' },
      members: {
        $in: [userId],
      },
    })

    const paginationResult: PaginationResult<GroupChat> = {
      meta: {
        pageIndex,
        perPage,
        totalCount,
      },
      payload: groupChats,
    }

    return paginationResult
  }
}
