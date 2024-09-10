import { Model, Types } from 'mongoose'
import { faker } from '@faker-js/faker'
import {
  ChatMessage,
  ChatType,
} from '@/modules/chat/infra/mongoose/schemas/chat-message'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

export function makeChatMessage(
  override: Partial<ChatMessage> = {},
  id?: string,
) {
  const chatMessage: ChatMessage = {
    _id: id ? new Types.ObjectId(id) : new Types.ObjectId(),
    chatId: new Types.ObjectId(),
    senderId: new Types.ObjectId(),
    text: faker.lorem.sentence(),
    chatType: ChatType.PRIVATE,
    createdAt: new Date(),
    isForwarded: false,
    ...override,
  }

  return chatMessage
}

@Injectable()
export class ChatMessageFactory {
  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
  ) {}

  async makeMongoChatMessage(data: Partial<ChatMessage> = {}) {
    const chatMessage = makeChatMessage(data)

    await this.chatMessageModel.create({
      ...chatMessage,
    })

    return chatMessage
  }
}
