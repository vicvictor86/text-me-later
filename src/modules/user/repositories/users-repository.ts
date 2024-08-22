import { CreateUserDto } from '../dtos/create-user-dto'
import { User } from '../infra/mongoose/user'

export abstract class UsersRepository {
  abstract create(user: CreateUserDto): Promise<void>

  abstract findByUsername(username: string): Promise<User | null>
}
