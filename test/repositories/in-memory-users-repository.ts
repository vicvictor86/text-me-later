import { User } from '@/modules/user/infra/mongoose/schemas/user'
import { UsersRepository } from '@/modules/user/repositories/users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async save(user: User): Promise<void> {
    const userIndex = this.items.findIndex((u) => u._id === user._id)

    this.items[userIndex] = user
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = this.items.find((user) => user.username === username)

    return user || null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((user) => user.email === email)

    return user || null
  }

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((user) => user._id.toString() === id)

    return user || null
  }
}
