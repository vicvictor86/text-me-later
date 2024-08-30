import { Types } from 'mongoose'
import { faker } from '@faker-js/faker'
import { PrivateChat } from '@/modules/chat/infra/mongoose/private-chat'
import { CreatePrivateChatRepositoryDto } from '@/modules/chat/dtos/create-private-chat.dto'

export function makePrivateChat(
  override: Partial<CreatePrivateChatRepositoryDto> = {},
  id?: string,
) {
  const privateChat: PrivateChat = {
    _id: id ? new Types.ObjectId(id) : new Types.ObjectId(),
    user1Id: new Types.ObjectId().toString(),
    user2Id: new Types.ObjectId().toString(),
    titleUser1: faker.internet.userName(),
    titleUser2: faker.internet.userName(),
    createdAt: new Date(),
    ...override,
  }

  return privateChat
}

// @Injectable()
// export class PrivateChatFactory {
//   constructor(
//     @InjectModel(PrivateChat.name) private privatechatModel: Model<PrivateChat>,
//   ) {}

//   async makeMongoPrivateChat(data: Partial<CreatePrivateChatDto> = {}) {
//     const privatechat = makePrivateChat(data)

//     await this.privatechatModel.create({
//       ...privatechat,
//     })

//     return privatechat
//   }
// }
