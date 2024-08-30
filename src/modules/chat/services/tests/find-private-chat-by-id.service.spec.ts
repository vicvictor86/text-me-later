import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { PrivateChatsService } from '../private-chats.service'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { makeUser } from 'test/factories/make-user'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository
let sut: PrivateChatsService

describe('Find Private Chat by Id Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryPrivateChatsRepository = new InMemoryPrivateChatsRepository()

    sut = new PrivateChatsService(
      inMemoryPrivateChatsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should be able to find a existing private chat by your id', async () => {
    const user1 = makeUser()
    await inMemoryUsersRepository.create(user1)

    const privateChat = makePrivateChat({ user1Id: user1._id.toString() })
    await inMemoryPrivateChatsRepository.create(privateChat)

    const result = await sut.findById({
      whoRequestingId: user1._id.toString(),
      chatId: privateChat._id.toString(),
    })

    const privateChatsOnDatabase = inMemoryPrivateChatsRepository.items

    expect(privateChatsOnDatabase).toHaveLength(1)
    expect(result.privateChat._id).toEqual(privateChat._id)
  })

  it('should not be able to find a private chat that not exists', async () => {
    const user1 = makeUser()

    expect(async () => {
      await sut.findById({
        whoRequestingId: user1._id.toString(),
        chatId: 'non-existing-id',
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to get a existing private chat if user is not a participant of the chat', async () => {
    const user1 = makeUser()
    const otherUser = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(otherUser)

    const privateChat = makePrivateChat({ user1Id: user1._id.toString() })
    await inMemoryPrivateChatsRepository.create(privateChat)

    expect(async () => {
      await sut.findById({
        whoRequestingId: otherUser._id.toString(),
        chatId: privateChat._id.toString(),
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })
})