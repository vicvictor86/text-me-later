import { CreateUserDto } from '@/modules/user/dtos/create-user.dto'
import { User } from '@/modules/user/infra/mongoose/user'
import { UsersRepository } from '@/modules/user/repositories/users-repository'
import { Types } from 'mongoose'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async create(user: CreateUserDto): Promise<void> {
    const newUser: User = {
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      ...user,
    }

    this.items.push(newUser)
  }

  async save(user: User): Promise<void> {
    const userIndex = this.items.findIndex((u) => u._id === user._id)

    this.items[userIndex] = user
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = this.items.find((user) => user.username === username)

    return user || null
  }

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((user) => user._id.toString() === id)

    return user || null
  }
}
