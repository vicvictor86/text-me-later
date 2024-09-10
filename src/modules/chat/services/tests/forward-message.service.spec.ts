import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { ChatMessagesService } from '../chat-messages.service'
import { InMemoryChatMessagesRepository } from 'test/repositories/in-memory-chat-messages-repository'
import { makeUser } from 'test/factories/make-user'
import { makeChatMessage } from 'test/factories/make-chat-message'
import { ChatType } from '../../infra/mongoose/schemas/chat-message'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

let inMemoryChatMessagesRepository: InMemoryChatMessagesRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository

let chatMessagesService: ChatMessagesService

describe('Forward Message Service', () => {
  beforeEach(() => {
    inMemoryChatMessagesRepository = new InMemoryChatMessagesRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryPrivateChatsRepository = new InMemoryPrivateChatsRepository()

    chatMessagesService = new ChatMessagesService(
      inMemoryChatMessagesRepository,
      inMemoryPrivateChatsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should be able to forward a message', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const privateChat = makePrivateChat({
      user1Id: user1._id,
      user2Id: user2._id,
      titleUser1: user2.username,
      titleUser2: user1.username,
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    for (let i = 0; i < 22; i++) {
      const chatMessage = makeChatMessage({
        chatId: privateChat._id,
        senderId: user1._id,
        text: `Hello ${i}`,
      })

      await inMemoryChatMessagesRepository.create(chatMessage)
    }

    const chatMessage = makeChatMessage({
      chatId: privateChat._id,
      senderId: user1._id,
      text: `Hello 22`,
    })
    await inMemoryChatMessagesRepository.create(chatMessage)

    await chatMessagesService.forwardMessage({
      chatType: ChatType.PRIVATE,
      chatId: privateChat._id.toString(),
      messageId: chatMessage._id.toString(),
      senderId: user2._id.toString(),
    })

    const messagesInDatabase =
      await inMemoryChatMessagesRepository.fetchByChatId({
        chatId: privateChat._id.toString(),
        paginationParams: {
          pageIndex: 0,
          perPage: 100,
        },
      })

    expect(messagesInDatabase.payload).toHaveLength(24)
    expect(messagesInDatabase.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: 'Hello 22',
          senderId: user2._id,
          isForwarded: true,
        }),
      ]),
    )
  })

  it('should not be able to forward a inexistent message', async () => {
    const user1 = makeUser()
    const user2 = makeUser()
    const otherUser = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)
    await inMemoryUsersRepository.create(otherUser)

    const privateChat = makePrivateChat({
      user1Id: user1._id,
      user2Id: user2._id,
      titleUser1: user2.username,
      titleUser2: user1.username,
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    for (let i = 0; i < 22; i++) {
      const chatMessage = makeChatMessage({
        chatId: privateChat._id,
        senderId: user1._id,
        text: `Hello ${i}`,
      })

      await inMemoryChatMessagesRepository.create(chatMessage)
    }

    const inexistentId = new UniqueEntityId().toString()

    expect(async () => {
      await chatMessagesService.forwardMessage({
        chatType: ChatType.PRIVATE,
        chatId: privateChat._id.toString(),
        messageId: inexistentId,
        senderId: user2._id.toString(),
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
