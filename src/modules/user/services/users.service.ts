import { Injectable } from '@nestjs/common'
import { CreateUserDto } from '../dtos/create-user.dto'
import { UsersRepository } from '../repositories/users-repository'
import { AccountStatus, User } from '../infra/mongoose/user'
import { HashComparer } from '@/shared/cryptography/domain/hash-comparer'
import { Encrypter } from '@/shared/cryptography/domain/encrypter'
import { AuthenticateUserDto } from '../dtos/authenticate-user.dto'
import { HashGenerator } from '@/shared/cryptography/domain/hash-generator'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { UserNotActiveError } from './errors/user-not-active.error'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

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
      throw new UserAlreadyExistsError('Username')
    }

    const emailAlreadyExists = await this.usersRepository.findByEmail(
      createUser.email,
    )

    if (emailAlreadyExists) {
      throw new UserAlreadyExistsError('Email')
    }

    createUser.password = await this.hashGenerator.hash(createUser.password)

    await this.usersRepository.create(createUser)
  }

  async findByUsername(username: string): Promise<{ user: User } | null> {
    const user = await this.usersRepository.findByUsername(username)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
    }

    return { user }
  }

  async confirmEmail(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new ResourceNotFoundError('Usuário')
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
      throw new ResourceNotFoundError('Usuário')
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UserNotActiveError()
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      user.password,
    )

    if (!passwordMatch) {
      throw new WrongCredentialsError()
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user._id.toString(),
    })

    return { accessToken }
  }
}
