import { User } from '@/modules/user/infra/mongoose/user'
import { UsersRepository } from '@/modules/user/repositories/users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async create(user: User) {
    this.items.push(user)
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = this.items.find((user) => user.username === username)

    return user || null
  }
}
