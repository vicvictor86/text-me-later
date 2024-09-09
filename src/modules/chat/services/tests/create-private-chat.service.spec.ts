import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { PrivateChatsService } from '../private-chats.service'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { ChatAlreadyExistsError } from '../../errors/chat-already-exists-error'
import { ChatMessagesService } from '../chat-messages.service'
import { InMemoryChatMessagesRepository } from 'test/repositories/in-memory-chat-messages-repository'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository
let inMemoryChatMessagesRepository: InMemoryChatMessagesRepository

let chatMessagesService: ChatMessagesService
let privateChatsService: PrivateChatsService

describe('Create Private Chat Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryPrivateChatsRepository = new InMemoryPrivateChatsRepository()
    inMemoryChatMessagesRepository = new InMemoryChatMessagesRepository()

    chatMessagesService = new ChatMessagesService(
      inMemoryChatMessagesRepository,
      inMemoryPrivateChatsRepository,
      inMemoryUsersRepository,
    )

    privateChatsService = new PrivateChatsService(
      inMemoryPrivateChatsRepository,
      inMemoryUsersRepository,
      chatMessagesService,
    )
  })

  it('should be able to a create a private chat', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    await privateChatsService.create({
      whoRequestingId: user1._id.toString(),
      otherUserId: user2._id.toString(),
      text: 'Oi',
    })

    const privateChatsOnDatabase = inMemoryPrivateChatsRepository.items

    expect(privateChatsOnDatabase).toHaveLength(1)
    expect(privateChatsOnDatabase[0]).toEqual(
      expect.objectContaining({
        user1Id: user1._id,
        user2Id: user2._id,
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
      user1Id: user1._id,
      user2Id: user2._id,
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    expect(async () => {
      await privateChatsService.create({
        whoRequestingId: user1._id.toString(),
        otherUserId: user2._id.toString(),
        text: 'Oi',
      })
    }).rejects.toBeInstanceOf(ChatAlreadyExistsError)

    const privateChatsOnDatabase = inMemoryPrivateChatsRepository.items

    expect(privateChatsOnDatabase).toHaveLength(1)
  })
})
