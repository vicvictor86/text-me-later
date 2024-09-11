import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error'
import { makeUser } from 'test/factories/make-user'
import { NotAllowedError } from '@/shared/errors/not-allowed-error'
import { InMemoryGroupChatsRepository } from 'test/repositories/in-memory-group-chats-repository'
import { GroupChatsService } from '../group-chats.service'
import { makeGroupChat } from 'test/factories/make-group-chat'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryGroupChatsRepository: InMemoryGroupChatsRepository

let groupChatsService: GroupChatsService

describe('Find Group Chat by Id Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryGroupChatsRepository = new InMemoryGroupChatsRepository()

    groupChatsService = new GroupChatsService(
      inMemoryGroupChatsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should be able to find a existing group chat by your id', async () => {
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

    const result = await groupChatsService.findById({
      whoRequestingId: user1._id.toString(),
      chatId: groupChat._id.toString(),
    })

    const groupChatsOnDatabase = inMemoryGroupChatsRepository.items

    expect(groupChatsOnDatabase).toHaveLength(1)
    expect(result.groupChat._id).toEqual(groupChat._id)
  })

  it('should not be able to find a group chat that not exists', async () => {
    const user1 = makeUser()
    const inexistentId = new UniqueEntityId().toString()

    expect(async () => {
      await groupChatsService.findById({
        whoRequestingId: user1._id.toString(),
        chatId: inexistentId,
      })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to get a existing group chat if user is not a participant of the chat', async () => {
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

    expect(async () => {
      await groupChatsService.findById({
        whoRequestingId: otherUser._id.toString(),
        chatId: groupChat._id.toString(),
      })
    }).rejects.toBeInstanceOf(NotAllowedError)
  })
})
