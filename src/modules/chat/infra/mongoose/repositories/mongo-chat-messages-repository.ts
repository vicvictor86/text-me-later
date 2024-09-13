import { FetchMessagesByChatIdRepositoryDto } from '@/modules/chat/dtos/fetch-messages-by-chat-id-service.dto'
import { ChatMessage } from '@/modules/chat/infra/mongoose/schemas/chat-message'
import { ChatMessagesRepository } from '@/modules/chat/repositories/chat-messages-repository'
import { PaginationResult } from '@/shared/database/repositories/pagination-params'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class MongoChatMessagesRepository implements ChatMessagesRepository {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessage>,
  ) {}

  async fetchByChatId({
    chatId,
    paginationParams,
  }: FetchMessagesByChatIdRepositoryDto): Promise<
    PaginationResult<ChatMessage>
  > {
    const { pageIndex, perPage, search } = paginationParams

    const chatMessages = await this.chatMessageModel
      .find(
        {
          chatId,
          text: { $regex: search || '', $options: 'i' },
        },
        {},
        { limit: perPage, skip: pageIndex * perPage, sort: { createdAt: -1 } },
      )
      .exec()

    const totalCount = await this.chatMessageModel.countDocuments({
      chatId,
      text: { $regex: search || '', $options: 'i' },
    })

    const paginationResult: PaginationResult<ChatMessage> = {
      meta: {
        pageIndex,
        perPage,
        totalCount,
      },
      payload: chatMessages,
    }

    return paginationResult
  }

  async create(chatMessage: ChatMessage): Promise<void> {
    await this.chatMessageModel.create(chatMessage)
  }

  async save({ _id, text, readBy, deletedBy }: ChatMessage): Promise<void> {
    await this.chatMessageModel.updateOne(
      {
        _id,
      },
      {
        text,
        readBy,
        deletedBy,
        updatedAt: new Date(),
      },
    )
  }

  async findById(id: UniqueEntityId): Promise<ChatMessage | null> {
    return this.chatMessageModel
      .findOne({
        _id: id.toObjectId(),
      })
      .exec()
  }
}
