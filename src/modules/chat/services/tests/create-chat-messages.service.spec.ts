import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { InMemoryChatMessagesRepository } from 'test/repositories/in-memory-chat-messages-repository'
import { ChatMessagesService } from '../chat-messages.service'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'
import { ChatType } from '../../infra/mongoose/schemas/chat-message'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'
import { InMemoryGroupChatsRepository } from 'test/repositories/in-memory-group-chats-repository'
import { makeGroupChat } from 'test/factories/make-group-chat'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository
let inMemoryChatMessagesRepository: InMemoryChatMessagesRepository
let inMemoryGroupChatsRepository: InMemoryGroupChatsRepository

let chatMessagesService: ChatMessagesService

describe('Create Chat Message Service', () => {
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

  it('should be able to a create a private chat message', async () => {
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

    await chatMessagesService.create({
      chatId: privateChat._id.toString(),
      chatType: ChatType.PRIVATE,
      senderId: user1._id.toString(),
      text: 'Hello',
    })

    const chatMessagesOnDatabase = inMemoryChatMessagesRepository.items

    expect(chatMessagesOnDatabase).toHaveLength(1)
    expect(chatMessagesOnDatabase[0]).toEqual(
      expect.objectContaining({
        chatId: privateChat._id,
        chatType: ChatType.PRIVATE,
        senderId: user1._id,
        text: 'Hello',
      }),
    )
  })

  it('should not be able to create a message on a private chat that not exists', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const inexistentId = new UniqueEntityId().toString()

    expect(async () => {
      await chatMessagesService.create({
        chatId: inexistentId,
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
      user1Id: user1._id,
      user2Id: user2._id,
    })
    await inMemoryPrivateChatsRepository.create(privateChat)

    expect(async () => {
      await chatMessagesService.create({
        chatId: privateChat._id.toString(),
        chatType: ChatType.PRIVATE,
        senderId: outerUser._id.toString(),
        text: 'Hello',
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })

  it('should be able to a create a group chat message', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const groupChat = makeGroupChat({
      members: [user1._id, user2._id],
      admins: [user1._id],
      name: 'group-chat',
    })
    await inMemoryGroupChatsRepository.create(groupChat)

    await chatMessagesService.create({
      chatId: groupChat._id.toString(),
      chatType: ChatType.GROUP,
      senderId: user1._id.toString(),
      text: 'Hello',
    })

    const chatMessagesOnDatabase = inMemoryChatMessagesRepository.items

    expect(chatMessagesOnDatabase).toHaveLength(1)
    expect(chatMessagesOnDatabase[0]).toEqual(
      expect.objectContaining({
        chatId: groupChat._id,
        chatType: ChatType.GROUP,
        senderId: user1._id,
        text: 'Hello',
      }),
    )
  })

  it('should not be able to create a message on a group chat that not exists', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const inexistentId = new UniqueEntityId().toString()

    expect(async () => {
      await chatMessagesService.create({
        chatId: inexistentId,
        chatType: ChatType.GROUP,
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

    const groupChat = makeGroupChat({
      members: [user1._id, user2._id],
      admins: [user1._id],
      name: 'group-chat',
    })
    await inMemoryGroupChatsRepository.create(groupChat)

    expect(async () => {
      await chatMessagesService.create({
        chatId: groupChat._id.toString(),
        chatType: ChatType.GROUP,
        senderId: outerUser._id.toString(),
        text: 'Hello',
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })
})
