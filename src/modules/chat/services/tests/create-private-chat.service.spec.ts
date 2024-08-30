import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { PrivateChatsService } from '../private-chats.service'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { ChatAlreadyExistsError } from '../../errors/chat-already-exists-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository
let sut: PrivateChatsService

describe('Create Private Chat Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryPrivateChatsRepository = new InMemoryPrivateChatsRepository()

    sut = new PrivateChatsService(
      inMemoryPrivateChatsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should be able to a create a private chat', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    await sut.create({
      whoRequestingId: user1._id.toString(),
      user1Id: user1._id.toString(),
      user2Id: user2._id.toString(),
    })

    const privateChatsOnDatabase = inMemoryPrivateChatsRepository.items

    expect(privateChatsOnDatabase).toHaveLength(1)
    expect(privateChatsOnDatabase[0]).toEqual(
      expect.objectContaining({
        user1Id: user1._id.toString(),
        user2Id: user2._id.toString(),
        titleUser1: user2.username,
        titleUser2: user1.username,
      }),
    )
  })

  it('should not be able to create a private chat with same two users', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const privateChat = makePrivateChat({
      user1Id: user1._id.toString(),
      user2Id: user2._id.toString(),
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    expect(async () => {
      await sut.create({
        whoRequestingId: user1._id.toString(),
        user1Id: user1._id.toString(),
        user2Id: user2._id.toString(),
      })
    }).rejects.toBeInstanceOf(ChatAlreadyExistsError)

    const privateChatsOnDatabase = inMemoryPrivateChatsRepository.items

    expect(privateChatsOnDatabase).toHaveLength(1)
  })

  it('should not be able to create a private chat if user is not in chat', async () => {
    const user1 = makeUser()
    const user2 = makeUser()
    const otherUser = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)
    await inMemoryUsersRepository.create(otherUser)

    const privateChat = makePrivateChat({
      user1Id: user1._id.toString(),
      user2Id: user2._id.toString(),
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    expect(async () => {
      await sut.create({
        whoRequestingId: otherUser._id.toString(),
        user1Id: user1._id.toString(),
        user2Id: user2._id.toString(),
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })
})
