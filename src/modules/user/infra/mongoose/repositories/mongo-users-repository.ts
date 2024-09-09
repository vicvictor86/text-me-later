import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UsersRepository } from '../../../repositories/users-repository'
import { User } from '../schemas/user'
import { CreateUserDto } from '../../../dtos/create-user.dto'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

@Injectable()
export class MongoUsersRepository implements UsersRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(user: CreateUserDto): Promise<void> {
    await this.userModel.create({
      name: user.name,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      pronoun: user.pronoun,
      password: user.password,
      birthDate: user.birthDate,
      avatar: user.avatar,
      accountStatus: user.accountStatus,
      bios: user.bios,
    })
  }

  async save(user: User): Promise<void> {
    await this.userModel.updateOne(
      {
        _id: user._id,
      },
      {
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        pronoun: user.pronoun,
        password: user.password,
        birthDate: user.birthDate,
        avatar: user.avatar,
        accountStatus: user.accountStatus,
        bios: user.bios,
      },
    )
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        username,
      })
      .exec()

    if (!user) {
      return null
    }

    return user
  }

  async findById(id: UniqueEntityId): Promise<User | null> {
    return this.userModel
      .findOne({
        _id: id.toObjectId(),
      })
      .exec()
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        email,
      })
      .exec()

    return user
  }
}
