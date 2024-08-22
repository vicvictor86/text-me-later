import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UsersService } from '../users.service'
import { makeUser } from 'test/factories/make-user'

let inMemoryUsersRepository: InMemoryUsersRepository
let sut: UsersService

describe('Find User Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new UsersService(inMemoryUsersRepository)
  })

  it('should be able to find a existing user by your username', async () => {
    const user = makeUser({ username: 'johndoe' })
    await inMemoryUsersRepository.create(user)

    const userFounded = await sut.findByUsername(user.username)

    if (!userFounded) {
      throw new Error('User not found')
    }

    const usersOnDatabase = inMemoryUsersRepository.items

    expect(usersOnDatabase).toHaveLength(1)
    expect(userFounded.username).toEqual('johndoe')
  })

  it('should be return null when user not exist', async () => {
    const userFounded = await sut.findByUsername('johndoe')

    expect(userFounded).toBeNull()
  })
})
