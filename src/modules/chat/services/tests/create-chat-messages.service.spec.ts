import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { InMemoryChatMessagesRepository } from 'test/repositories/in-mermory-chat-messages-repository'
import { ChatMessagesService } from '../chat-messages.service'
import { ChatType } from '../../infra/mongoose/chat-message'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository
let inMemoryChatMessagesRepository: InMemoryChatMessagesRepository
let sut: ChatMessagesService

describe('Create Chat Message Service', () => {
  beforeEach(() => {
    inMemoryChatMessagesRepository = new InMemoryChatMessagesRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryPrivateChatsRepository = new InMemoryPrivateChatsRepository()

    sut = new ChatMessagesService(
      inMemoryChatMessagesRepository,
      inMemoryPrivateChatsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should be able to a create a chat message', async () => {
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

    await sut.create({
      whoRequestingId: user1._id.toString(),
      chatId: privateChat._id.toString(),
      chatType: ChatType.PRIVATE,
      senderId: user1._id.toString(),
      text: 'Hello',
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

  it('should not be able to create a message on a private chat that not exists', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    expect(async () => {
      await sut.create({
        whoRequestingId: user1._id.toString(),
        chatId: 'non-existing-id',
        chatType: ChatType.PRIVATE,
        senderId: user1._id.toString(),
        text: 'Hello',
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a message if sender is not part of chat', async () => {
    const user1 = makeUser()
    const user2 = makeUser()
    const outerUser = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)
    await inMemoryUsersRepository.create(outerUser)

    const privateChat = makePrivateChat({
      user1Id: user1._id.toString(),
      user2Id: user2._id.toString(),
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    expect(async () => {
      await sut.create({
        whoRequestingId: outerUser._id.toString(),
        chatId: privateChat._id.toString(),
        chatType: ChatType.PRIVATE,
        senderId: outerUser._id.toString(),
        text: 'Hello',
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to create a message if sender id and whoRequesting Id is different', async () => {
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
        chatId: privateChat._id.toString(),
        chatType: ChatType.PRIVATE,
        senderId: 'non-existing-id',
        text: 'Hello',
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })
})
