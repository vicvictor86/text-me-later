import { CreateUserDto } from '../dtos/create-user.dto'
import { User } from '../infra/mongoose/schemas/user'

export abstract class UsersRepository {
  abstract create(user: CreateUserDto): Promise<void>
  abstract save(user: User): Promise<void>

  abstract findById(id: string): Promise<User | null>
  abstract findByUsername(username: string): Promise<User | null>
  abstract findByEmail(email: string): Promise<User | null>
}
