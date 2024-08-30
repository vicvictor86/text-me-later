import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UsersService } from '../users.service'
import { makeUser } from 'test/factories/make-user'
import { AccountStatus } from '../../infra/mongoose/user'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeEncrypter: FakeEncrypter
let fakeHasher: FakeHasher
let sut: UsersService

describe('Confirm Email User Service', () => {
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

  it('should be able to confirm a existing user email', async () => {
    const user = makeUser({ username: 'johndoe' })
    await inMemoryUsersRepository.create(user)

    await sut.confirmEmail(user._id.toString())

    const usersOnDatabase = inMemoryUsersRepository.items

    expect(usersOnDatabase).toHaveLength(1)
    expect(usersOnDatabase[0].accountStatus).toEqual(AccountStatus.ACTIVE)
  })

  it('should not be able to confirm a email from a non existing user', async () => {
    expect(async () => {
      await sut.confirmEmail('non-existing-id')
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
