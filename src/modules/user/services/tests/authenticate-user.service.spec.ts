import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UsersService } from '../users.service'
import { makeUser } from 'test/factories/make-user'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { AccountStatus } from '../../infra/mongoose/schemas/user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { WrongCredentialsError } from '../errors/wrong-credentials-error'
import { UserNotActiveError } from '../errors/user-not-active.error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeEncrypter: FakeEncrypter
let fakeHasher: FakeHasher
let sut: UsersService

describe('Authenticate User Service', () => {
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

  it('should be able to authenticate a existing user by username', async () => {
    const user = makeUser({
      username: 'johndoe',
      password: 'password-hashed',
      accountStatus: AccountStatus.ACTIVE,
    })
    await inMemoryUsersRepository.create(user)

    const result = await sut.authenticate({
      username: 'johndoe',
      password: 'password',
    })

    expect(result.accessToken).toEqual(expect.any(String))
  })

  it('should not be able to authenticate a client with username that not exists', async () => {
    expect(async () => {
      await sut.authenticate({
        username: 'johndoe',
        password: '123456',
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to authenticate a client with wrong password', async () => {
    const user = makeUser({
      username: 'johndoe',
      password: 'password-hashed',
      accountStatus: AccountStatus.ACTIVE,
    })
    await inMemoryUsersRepository.create(user)

    expect(async () => {
      await sut.authenticate({
        username: 'johndoe',
        password: 'wrong-password',
      })
    }).rejects.toBeInstanceOf(WrongCredentialsError)
  })

  it('should not be able to authenticate a client that not confirmed the email', async () => {
    const user = makeUser({
      username: 'johndoe',
      password: 'password-hashed',
      accountStatus: AccountStatus.WAITING_FOR_EMAIL,
    })
    await inMemoryUsersRepository.create(user)

    expect(async () => {
      await sut.authenticate({
        username: 'johndoe',
        password: 'password-hashed',
      })
    }).rejects.toBeInstanceOf(UserNotActiveError)
  })
})
