import { Model, Types } from 'mongoose'
import { faker } from '@faker-js/faker'
import { PrivateChat } from '@/modules/chat/infra/mongoose/schemas/private-chat'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

export function makePrivateChat(
  override: Partial<PrivateChat> = {},
  id?: string,
) {
  const privateChat: PrivateChat = {
    _id: id ? new Types.ObjectId(id) : new Types.ObjectId(),
    user1Id: new Types.ObjectId(),
    user2Id: new Types.ObjectId(),
    titleUser1: faker.internet.userName(),
    titleUser2: faker.internet.userName(),
    createdAt: new Date(),
    ...override,
  }

  return privateChat
}

@Injectable()
export class PrivateChatFactory {
  constructor(
    @InjectModel(PrivateChat.name) private privateChatModel: Model<PrivateChat>,
  ) {}

  async makeMongoPrivateChat(data: Partial<PrivateChat> = {}) {
    const privateChat = makePrivateChat(data)

    await this.privateChatModel.create({
      ...privateChat,
    })

    return privateChat
  }
}
