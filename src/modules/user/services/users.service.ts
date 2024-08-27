import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { CreateUserDto } from '../dtos/create-user.dto'
import { UsersRepository } from '../repositories/users-repository'
import { AccountStatus, User } from '../infra/mongoose/user'
import { HashComparer } from '@/shared/cryptography/domain/hash-comparer'
import { Encrypter } from '@/shared/cryptography/domain/encrypter'
import { AuthenticateUserDto } from './dtos/authenticate-user.dto'
import { HashGenerator } from '@/shared/cryptography/domain/hash-generator'

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private hashGenerator: HashGenerator,
    private encrypter: Encrypter,
  ) {}

  async create(createUser: CreateUserDto): Promise<void> {
    const usernameAlreadyExists = await this.usersRepository.findByUsername(
      createUser.username,
    )

    if (usernameAlreadyExists) {
      throw new ConflictException('Username already exists')
    }

    createUser.password = await this.hashGenerator.hash(createUser.password)

    await this.usersRepository.create(createUser)
  }

  async findByUsername(username: string): Promise<{ user: User } | null> {
    const user = await this.usersRepository.findByUsername(username)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return { user }
  }

  async confirmEmail(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    user.accountStatus = AccountStatus.ACTIVE

    await this.usersRepository.save(user)
  }

  async authenticate({
    username,
    password,
  }: AuthenticateUserDto): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findByUsername(username)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('User not active')
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      user.password,
    )

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user._id.toString(),
    })

    return { accessToken }
  }
}
