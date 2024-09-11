import { Model, Types } from 'mongoose'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GroupChat } from '@/modules/chat/infra/mongoose/schemas/group-chat'

export function makeGroupChat(override: Partial<GroupChat> = {}, id?: string) {
  const groupChat: GroupChat = {
    _id: id ? new Types.ObjectId(id) : new Types.ObjectId(),
    admins: [new Types.ObjectId()],
    members: [new Types.ObjectId()],
    name: faker.internet.userName(),
    description: faker.lorem.sentence(),
    createdAt: new Date(),
    ...override,
  }

  return groupChat
}

@Injectable()
export class GroupChatFactory {
  constructor(
    @InjectModel(GroupChat.name) private groupChatModel: Model<GroupChat>,
  ) {}

  async makeMongoGroupChat(data: Partial<GroupChat> = {}) {
    const groupChat = makeGroupChat(data)

    await this.groupChatModel.create({
      ...groupChat,
    })

    return groupChat
  }
}
