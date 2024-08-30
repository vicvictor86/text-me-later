import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { PrivateChatsService } from '../private-chats.service'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { makeUser } from 'test/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository
let sut: PrivateChatsService

describe('Find Private Chat by Title Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryPrivateChatsRepository = new InMemoryPrivateChatsRepository()

    sut = new PrivateChatsService(
      inMemoryPrivateChatsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should be able to find a existing private chat by your title', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const privateChat = makePrivateChat({
      user1Id: user1._id.toString(),
      user2Id: user2._id.toString(),
      titleUser1: 'title-user-1',
      titleUser2: user1.username,
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    const result = await sut.findByTitle({
      title: privateChat.titleUser1,
      whoRequestingId: privateChat.user1Id,
    })

    const privateChatsOnDatabase = inMemoryPrivateChatsRepository.items

    expect(privateChatsOnDatabase).toHaveLength(1)
    expect(result.privateChat).toEqual(
      expect.objectContaining({
        user1Id: user1._id.toString(),
        user2Id: user2._id.toString(),
        titleUser1: 'title-user-1',
        titleUser2: user1.username,
      }),
    )
  })

  it('should return not found when user insert a title that its the title of other user chat', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const privateChat = makePrivateChat({
      user1Id: user1._id.toString(),
      user2Id: user2._id.toString(),
      titleUser1: user2.username,
      titleUser2: user1.username,
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    expect(async () => {
      await sut.findByTitle({
        title: user1.username,
        whoRequestingId: user1._id.toString(),
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return not found when private chat not exist', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const privateChat = makePrivateChat({
      user1Id: user1._id.toString(),
      user2Id: user2._id.toString(),
      titleUser1: user2.username,
      titleUser2: user1.username,
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    expect(async () => {
      await sut.findByTitle({
        title: 'non-existing-title',
        whoRequestingId: user1._id.toString(),
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
