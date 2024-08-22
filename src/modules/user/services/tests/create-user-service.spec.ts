import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UsersService } from '../users.service'
import { makeUser } from 'test/factories/make-user'
import { ConflictException } from '@nestjs/common'

let inMemoryUsersRepository: InMemoryUsersRepository
let sut: UsersService

describe('Create User Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new UsersService(inMemoryUsersRepository)
  })

  it('should be able to a create a user', async () => {
    const user = makeUser()

    await sut.create({
      username: user.username,
      accountStatus: user.accountStatus,
      avatar: user.avatar,
      bios: user.bios,
      birthDate: user.birthDate,
      email: user.email,
      name: user.name,
      password: user.password,
      phoneNumber: user.phoneNumber,
      pronoun: user.pronoun,
    })

    const usersOnDatabase = inMemoryUsersRepository.items

    expect(usersOnDatabase).toHaveLength(1)
    expect(usersOnDatabase[0]).toEqual(
      expect.objectContaining({
        username: user.username,
        accountStatus: user.accountStatus,
        avatar: user.avatar,
        bios: user.bios,
        birthDate: user.birthDate,
        email: user.email,
        name: user.name,
        password: user.password,
        phoneNumber: user.phoneNumber,
        pronoun: user.pronoun,
      }),
    )
  })

  it('should not be able to create a user with same username', async () => {
    const user = makeUser({ username: 'johndoe' })
    await inMemoryUsersRepository.create(user)

    expect(async () => {
      await sut.create({
        username: 'johndoe',
        accountStatus: user.accountStatus,
        avatar: user.avatar,
        bios: user.bios,
        birthDate: user.birthDate,
        email: user.email,
        name: user.name,
        password: user.password,
        phoneNumber: user.phoneNumber,
        pronoun: user.pronoun,
      })
    }).rejects.toBeInstanceOf(ConflictException)

    const usersOnDatabase = inMemoryUsersRepository.items

    expect(usersOnDatabase).toHaveLength(1)
  })
})
