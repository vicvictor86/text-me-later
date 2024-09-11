import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { InMemoryGroupChatsRepository } from 'test/repositories/in-memory-group-chats-repository'
import { GroupChatsService } from '../group-chats.service'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryGroupChatsRepository: InMemoryGroupChatsRepository

let groupChatsService: GroupChatsService

describe('Create Group Chat Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryGroupChatsRepository = new InMemoryGroupChatsRepository()

    groupChatsService = new GroupChatsService(
      inMemoryGroupChatsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should be able to a create a group chat', async () => {
    const user1 = makeUser()
    const user2 = makeUser()
    const user3 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)
    await inMemoryUsersRepository.create(user3)

    await groupChatsService.create({
      whoRequestingId: user1._id.toString(),
      members: [
        user1._id.toString(),
        user2._id.toString(),
        user3._id.toString(),
      ],
      name: 'Group Chat',
      description: 'Group Chat Description',
    })

    const groupChatsOnDatabase = inMemoryGroupChatsRepository.items

    expect(groupChatsOnDatabase).toHaveLength(1)
    expect(groupChatsOnDatabase[0]).toEqual(
      expect.objectContaining({
        members: expect.arrayContaining([user1._id, user2._id, user3._id]),
        name: 'Group Chat',
        description: 'Group Chat Description',
        admins: [user1._id],
      }),
    )
  })

  it('should be able to a create a group chat even if the group creator is not specified on request', async () => {
    const user1 = makeUser()
    const user2 = makeUser()
    const user3 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)
    await inMemoryUsersRepository.create(user3)

    await groupChatsService.create({
      whoRequestingId: user1._id.toString(),
      members: [user2._id.toString(), user3._id.toString()],
      name: 'Group Chat',
      description: 'Group Chat Description',
    })

    const groupChatsOnDatabase = inMemoryGroupChatsRepository.items

    expect(groupChatsOnDatabase).toHaveLength(1)
    expect(groupChatsOnDatabase[0]).toEqual(
      expect.objectContaining({
        members: expect.arrayContaining([user1._id, user2._id, user3._id]),
        name: 'Group Chat',
        description: 'Group Chat Description',
        admins: [user1._id],
      }),
    )
  })

  it('should not be able to create a group chat with a inexistent user member', async () => {
    const user1 = makeUser()
    const user2 = makeUser()

    await inMemoryUsersRepository.create(user1)
    await inMemoryUsersRepository.create(user2)

    const inexistentId = new UniqueEntityId().toString()

    expect(async () => {
      await groupChatsService.create({
        whoRequestingId: user1._id.toString(),
        members: [user2._id.toString(), inexistentId],
        name: 'Group Chat',
        description: 'Group Chat Description',
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)

    const groupChatsOnDatabase = inMemoryGroupChatsRepository.items
    expect(groupChatsOnDatabase).toHaveLength(0)
  })
})
