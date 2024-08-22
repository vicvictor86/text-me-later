import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from '../dtos/create-user-dto'
import { UsersRepository } from '../repositories/users-repository'
import { User } from '../infra/mongoose/user'

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUser: CreateUserDto): Promise<void> {
    const usernameAlreadyExists = await this.usersRepository.findByUsername(
      createUser.username,
    )

    if (usernameAlreadyExists) {
      throw new ConflictException('Username already exists')
    }

    await this.usersRepository.create(createUser)
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findByUsername(username)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }
}
