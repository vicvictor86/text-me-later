import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { ChatMessagesService } from '../chat-messages.service'
import { InMemoryChatMessagesRepository } from 'test/repositories/in-memory-chat-messages-repository'
import { makeUser } from 'test/factories/make-user'
import { makeChatMessage } from 'test/factories/make-chat-message'
import { ChatType } from '../../infra/mongoose/schemas/chat-message'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'
import { InMemoryGroupChatsRepository } from 'test/repositories/in-memory-group-chats-repository'
import { makeGroupChat } from 'test/factories/make-group-chat'

let inMemoryChatMessagesRepository: InMemoryChatMessagesRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository
let inMemoryGroupChatsRepository: InMemoryGroupChatsRepository

let chatMessagesService: ChatMessagesService

describe('Fetch Messages By Chat Id Service', () => {
  beforeEach(() => {
    inMemoryChatMessagesRepository = new InMemoryChatMessagesRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryPrivateChatsRepository = new InMemoryPrivateChatsRepository()
    inMemoryGroupChatsRepository = new InMemoryGroupChatsRepository()

    chatMessagesService = new ChatMessagesService(
      inMemoryChatMessagesRepository,
      inMemoryPrivateChatsRepository,
      inMemoryUsersRepository,
      inMemoryGroupChatsRepository,
    )
  })

  it('should be able to fetch messages from a existing private chat by your id', async () => {
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

    const result = await chatMessagesService.fetchByChatId({
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
    expect(result.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chatId: privateChat._id,
          senderId: user1._id,
          text: 'Hello 20',
        }),
        expect.objectContaining({
          chatId: privateChat._id,
          senderId: user1._id,
          text: 'Hello 21',
        }),
      ]),
    )
  })

  it('should not be able to fetch messages from a non existing private chat', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const inexistentId = new UniqueEntityId().toString()

    expect(async () => {
      await chatMessagesService.fetchByChatId({
        whoRequestingId: user1._id.toString(),
        chatType: ChatType.PRIVATE,
        chatId: inexistentId,
        paginationParams: {
          pageIndex: 2,
          perPage: 10,
        },
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to a user that not participate of the private chat fetch the messages', async () => {
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

    expect(async () => {
      await chatMessagesService.fetchByChatId({
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

  it('should be able to fetch messages from a existing group chat by your id', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const groupChat = makeGroupChat({
      members: [user1._id, user2._id],
      admins: [user1._id],
      name: 'group-chat',
      description: 'group-chat-description',
    })
    await inMemoryGroupChatsRepository.create(groupChat)

    for (let i = 0; i < 22; i++) {
      const chatMessage = makeChatMessage({
        chatId: groupChat._id,
        senderId: user1._id,
        text: `Hello ${i}`,
      })

      await inMemoryChatMessagesRepository.create(chatMessage)
    }

    const result = await chatMessagesService.fetchByChatId({
      whoRequestingId: user1._id.toString(),
      chatType: ChatType.GROUP,
      chatId: groupChat._id.toString(),
      paginationParams: {
        pageIndex: 2,
        perPage: 10,
      },
    })

    expect(result.payload).toHaveLength(2)
    expect(result.meta.totalCount).toBe(22)
    expect(result.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chatId: groupChat._id,
          senderId: user1._id,
          text: 'Hello 20',
        }),
        expect.objectContaining({
          chatId: groupChat._id,
          senderId: user1._id,
          text: 'Hello 21',
        }),
      ]),
    )
  })

  it('should not be able to fetch messages from a non existing group chat', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const inexistentId = new UniqueEntityId().toString()

    expect(async () => {
      await chatMessagesService.fetchByChatId({
        whoRequestingId: user1._id.toString(),
        chatType: ChatType.GROUP,
        chatId: inexistentId,
        paginationParams: {
          pageIndex: 2,
          perPage: 10,
        },
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to a user that not participate of the group chat fetch the messages', async () => {
    const user1 = makeUser()
    const user2 = makeUser()
    const otherUser = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)
    await inMemoryUsersRepository.create(otherUser)

    const groupChat = makeGroupChat({
      members: [user1._id, user2._id],
      admins: [user1._id],
      name: 'group-chat',
      description: 'group-chat-description',
    })
    await inMemoryGroupChatsRepository.create(groupChat)

    for (let i = 0; i < 22; i++) {
      const chatMessage = makeChatMessage({
        chatId: groupChat._id,
        senderId: user1._id,
        text: `Hello ${i}`,
      })

      await inMemoryChatMessagesRepository.create(chatMessage)
    }

    expect(async () => {
      await chatMessagesService.fetchByChatId({
        whoRequestingId: otherUser._id.toString(),
        chatType: ChatType.GROUP,
        chatId: groupChat._id.toString(),
        paginationParams: {
          pageIndex: 0,
          perPage: 10,
        },
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })
})
