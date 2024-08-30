import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { ChatMessagesService } from '../chat-messages.service'
import { InMemoryChatMessagesRepository } from 'test/repositories/in-mermory-chat-messages-repository'
import { makeUser } from 'test/factories/make-user'
import { makeChatMessage } from 'test/factories/make-chat-message'
import { ChatType } from '../../infra/mongoose/chat-message'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'

let inMemoryChatMessagesRepository: InMemoryChatMessagesRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository
let sut: ChatMessagesService

describe('Fetch Messages By Chat Id Service', () => {
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

  it('should be able to fetch messages from a existing private chat by your id', async () => {
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

    for (let i = 0; i < 22; i++) {
      const chatMessage = makeChatMessage({
        chatId: privateChat._id.toString(),
        senderId: user1._id.toString(),
        text: `Hello ${i}`,
      })

      await inMemoryChatMessagesRepository.create(chatMessage)
    }

    const result = await sut.fetchByChatId({
      whoRequestingId: user1._id.toString(),
      chatType: ChatType.PRIVATE,
      chatId: privateChat._id.toString(),
      paginationParams: {
        pageIndex: 2,
        perPage: 10,
      },
    })

    expect(result.payload).toHaveLength(2)
    expect(result.meta.totalCount).toBe(22)
  })

  it('should return empty array if chat not exist', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    expect(async () => {
      await sut.fetchByChatId({
        whoRequestingId: user1._id.toString(),
        chatType: ChatType.PRIVATE,
        chatId: 'non-existing-id',
        paginationParams: {
          pageIndex: 2,
          perPage: 10,
        },
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to a user that not participate of a chat fetch the messages', async () => {
    const user1 = makeUser()
    const user2 = makeUser()
    const otherUser = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)
    await inMemoryUsersRepository.create(otherUser)

    const privateChat = makePrivateChat({
      user1Id: user1._id.toString(),
      user2Id: user2._id.toString(),
      titleUser1: user2.username,
      titleUser2: user1.username,
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    for (let i = 0; i < 22; i++) {
      const chatMessage = makeChatMessage({
        chatId: privateChat._id.toString(),
        senderId: user1._id.toString(),
        text: `Hello ${i}`,
      })

      await inMemoryChatMessagesRepository.create(chatMessage)
    }

    expect(async () => {
      await sut.fetchByChatId({
        whoRequestingId: otherUser._id.toString(),
        chatType: ChatType.PRIVATE,
        chatId: privateChat._id.toString(),
        paginationParams: {
          pageIndex: 0,
          perPage: 10,
        },
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })
})
