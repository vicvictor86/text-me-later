import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { InMemoryGroupChatsRepository } from 'test/repositories/in-memory-group-chats-repository'
import { GroupChatsService } from '../group-chats.service'
import { makeGroupChat } from 'test/factories/make-group-chat'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryGroupChatsRepository: InMemoryGroupChatsRepository

let groupChatsService: GroupChatsService

describe('Fetch Private Chats by User Id Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryGroupChatsRepository = new InMemoryGroupChatsRepository()

    groupChatsService = new GroupChatsService(
      inMemoryGroupChatsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should be able to fetch existing group chats by user id', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    for (let i = 0; i < 22; i++) {
      const randomUser = makeUser()
      await inMemoryUsersRepository.create(randomUser)

      const groupChat = makeGroupChat({
        members: [user1._id, user2._id],
        admins: [user1._id],
        name: `group-chat-${i}`,
        description: 'group-chat-description',
      })
      await inMemoryGroupChatsRepository.create(groupChat)
    }

    const result = await groupChatsService.fetchByUserId({
      paginationParams: {
        pageIndex: 2,
        perPage: 10,
        search: '',
      },
      userId: user1._id.toString(),
    })

    expect(result.groupChats.meta.totalCount).toBe(22)
    expect(result.groupChats.meta.pageIndex).toBe(2)
    expect(result.groupChats.meta.perPage).toBe(10)

    expect(result.groupChats.payload).toHaveLength(2)
    expect(result.groupChats.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          members: expect.arrayContaining([user1._id, user2._id]),
          admins: expect.arrayContaining([user1._id]),
          name: 'group-chat-20',
        }),
        expect.objectContaining({
          members: expect.arrayContaining([user1._id, user2._id]),
          admins: expect.arrayContaining([user1._id]),
          name: 'group-chat-21',
        }),
      ]),
    )
  })
})
