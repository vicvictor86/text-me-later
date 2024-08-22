import { CreateUserDto } from '@/modules/user/dtos/create-user-dto'
import {
  AccountStatus,
  Pronoun,
  User,
} from '@/modules/user/infra/mongoose/user'
import { Types, Model } from 'mongoose'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

export function makeUser(override: Partial<CreateUserDto> = {}, id?: string) {
  const user: User = {
    _id: id ? new Types.ObjectId(id) : new Types.ObjectId(),
    name: faker.person.firstName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    pronoun: Pronoun.OTHER,
    password: faker.internet.password(),
    birthDate: faker.date.past(),
    avatar: faker.image.avatar(),
    accountStatus: AccountStatus.WAITING_FOR_EMAIL,
    bios: faker.lorem.paragraph(),
    createdAt: new Date(),
    ...override,
  }

  return user
}

@Injectable()
export class UserFactory {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async makeMongoUser(data: Partial<CreateUserDto> = {}) {
    const user = makeUser(data)

    await this.userModel.create({
      ...user,
    })

    return user
  }
}
