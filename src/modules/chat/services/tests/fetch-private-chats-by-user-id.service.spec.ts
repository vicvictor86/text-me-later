import { InMemoryPrivateChatsRepository } from 'test/repositories/in-memory-private-chats-repository'
import { PrivateChatsService } from '../private-chats.service'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makePrivateChat } from 'test/factories/make-private-chat'
import { makeUser } from 'test/factories/make-user'
import { InMemoryChatMessagesRepository } from 'test/repositories/in-mermory-chat-messages-repository'
import { ChatMessagesService } from '../chat-messages.service'

let inMemoryChatMessagesRepository: InMemoryChatMessagesRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryPrivateChatsRepository: InMemoryPrivateChatsRepository

let chatMessagesService: ChatMessagesService
let privateChatsService: PrivateChatsService

describe('Fetch Private Chats by User Id Service', () => {
  beforeEach(() => {
    inMemoryChatMessagesRepository = new InMemoryChatMessagesRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryPrivateChatsRepository = new InMemoryPrivateChatsRepository()

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

  it('should be able to fetch existing private chats by user id', async () => {
    const user1 = makeUser()
    await inMemoryUsersRepository.create(user1)

    for (let i = 0; i < 22; i++) {
      const randomUser = makeUser()
      await inMemoryUsersRepository.create(randomUser)

      const privateChat = makePrivateChat({
        user1Id: user1._id,
        user2Id: randomUser._id,
        titleUser1: `title-user-${i}`,
        titleUser2: user1.username,
      })
      await inMemoryPrivateChatsRepository.create(privateChat)
    }

    const result = await privateChatsService.fetchByUserId({
      paginationParams: {
        pageIndex: 2,
        perPage: 10,
        search: '',
      },
      userId: user1._id.toString(),
    })

    expect(result.privateChats.meta.totalCount).toBe(22)
    expect(result.privateChats.meta.pageIndex).toBe(2)
    expect(result.privateChats.meta.perPage).toBe(10)

    expect(result.privateChats.payload).toHaveLength(2)
    expect(result.privateChats.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user1Id: user1._id,
          titleUser1: 'title-user-21',
          titleUser2: user1.username,
        }),
        expect.objectContaining({
          user1Id: user1._id,
          titleUser1: 'title-user-20',
          titleUser2: user1.username,
        }),
      ]),
    )
  })
})
