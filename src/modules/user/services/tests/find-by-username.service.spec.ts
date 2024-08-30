import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UsersService } from '../users.service'
import { makeUser } from 'test/factories/make-user'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeEncrypter: FakeEncrypter
let fakeHasher: FakeHasher
let sut: UsersService

describe('Find User Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeEncrypter = new FakeEncrypter()
    fakeHasher = new FakeHasher()

    sut = new UsersService(
      inMemoryUsersRepository,
      fakeHasher,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should be able to find a existing user by your username', async () => {
    const user = makeUser({ username: 'johndoe' })
    await inMemoryUsersRepository.create(user)

    const result = await sut.findByUsername(user.username)

    if (!result.user) {
      throw new Error('User not found')
    }

    const usersOnDatabase = inMemoryUsersRepository.items

    expect(usersOnDatabase).toHaveLength(1)
    expect(result.user.username).toEqual('johndoe')
  })

  it('should be return null when user not exist', async () => {
    expect(async () => {
      await sut.findByUsername('johndoe')
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
