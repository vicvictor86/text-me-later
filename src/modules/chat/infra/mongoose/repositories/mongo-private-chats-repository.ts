import { FetchPrivateChatsByUserIdRepositoryDto } from '@/modules/chat/dtos/fetch-private-chats-by-user-id-service.dto copy'
import { PrivateChat } from '@/modules/chat/infra/mongoose/schemas/private-chat'
import {
  FindByUsersIdProps,
  PrivateChatsRepository,
} from '@/modules/chat/repositories/private-chats-repository'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class MongoPrivateChatsRepository implements PrivateChatsRepository {
  constructor(
    @InjectModel(PrivateChat.name)
    private privateChatModel: Model<PrivateChat>,
  ) {}

  async create({
    titleUser1,
    titleUser2,
    user1Id,
    user2Id,
  }: PrivateChat): Promise<PrivateChat> {
    const privateChat = await this.privateChatModel.create({
      titleUser1,
      titleUser2,
      user1Id,
      user2Id,
    })

    return privateChat
  }

  async save(privateChat: PrivateChat): Promise<void> {
    await this.privateChatModel.updateOne(
      {
        _id: privateChat._id,
      },
      {
        titleUser1: privateChat.titleUser1,
        titleUser2: privateChat.titleUser2,
        updatedAt: new Date(),
      },
    )
  }

  async findById(id: UniqueEntityId): Promise<PrivateChat | null> {
    return this.privateChatModel
      .findOne({
        _id: id.toObjectId(),
      })
      .exec()
  }

  async findByUsersId({
    user1Id,
    user2Id,
  }: FindByUsersIdProps): Promise<PrivateChat | null> {
    return this.privateChatModel
      .findOne({
        user1Id,
        user2Id,
      })
      .exec()
  }

  async fetchByUserId({
    paginationParams,
    userId,
  }: FetchPrivateChatsByUserIdRepositoryDto): Promise<
    PaginationResult<PrivateChat>
  > {
    const { pageIndex, perPage, search } = paginationParams

    const privateChats = await this.privateChatModel
      .find(
        {
          $or: [
            {
              titleUser1: { $regex: search || '', $options: 'i' },
              user1Id: userId,
            },
            {
              titleUser2: { $regex: search || '', $options: 'i' },
              user2Id: userId,
            },
          ],
        },
        {},
        { limit: perPage, skip: pageIndex * perPage, sort: { createdAt: -1 } },
      )
      .exec()

    const totalCount = await this.privateChatModel.countDocuments({
      $or: [
        {
          titleUser1: { $regex: search || '', $options: 'i' },
          user1Id: userId,
        },
        {
          titleUser2: { $regex: search || '', $options: 'i' },
          user2Id: userId,
        },
      ],
    })

    const paginationResult: PaginationResult<PrivateChat> = {
      meta: {
        pageIndex,
        perPage,
        totalCount,
      },
      payload: privateChats,
    }

    return paginationResult
  }
}
