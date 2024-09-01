import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { Socket, connect } from 'socket.io-client'
import { UserFactory } from 'test/factories/make-user'
import { PrivateChatsRepository } from '../../../repositories/private-chats-repository'
import { EnvModule } from '@/shared/env/infra/env.module'
import { EnvService } from '@/shared/env/infra/env.service'
import { asyncWebsocketEmit } from '../utils/await-websocket-emit'
import { CreatePrivateChatDto } from '@/modules/chat/dtos/create-private-chat.dto'
import { CreatePrivateChatResponseDto } from '@/modules/chat/dtos/create-private-chat-response.dto'
import { PrivateChatFactory } from 'test/factories/make-private-chat'
import { CreateChatMessageDto } from '@/modules/chat/dtos/create-chat-message.dto'
import { ChatType } from '../../mongoose/schemas/chat-message'
import { ChatMessagesRepository } from '@/modules/chat/repositories/chat-messages-repository'

describe('Chat Web Socket Test (e2e)', () => {
  let app: INestApplication
  let socket: Socket
  let chatMessagesRepository: ChatMessagesRepository
  let privateChatsRepository: PrivateChatsRepository
  let userFactory: UserFactory
  let privateChatFactory: PrivateChatFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, EnvModule],
      providers: [UserFactory, PrivateChatFactory, EnvService],
    }).compile()

    const envService = moduleRef.get(EnvService)

    const port = envService.get('PORT')

    app = moduleRef.createNestApplication()

    privateChatsRepository = moduleRef.get(PrivateChatsRepository)
    chatMessagesRepository = moduleRef.get(ChatMessagesRepository)

    userFactory = moduleRef.get(UserFactory)
    privateChatFactory = moduleRef.get(PrivateChatFactory)

    await app.init()

    app.listen(port)
    socket = connect(`http://localhost:${port}`, {
      forceNew: true,
    })
  })

  afterAll(async () => {
    await app.close()
    socket.close()
  })

  test('User send first message to other user', async () => {
    const user1 = await userFactory.makeMongoUser({ username: 'johndoe' })
    const user2 = await userFactory.makeMongoUser({ username: 'mariadoe' })

    const user1Id = user1._id.toString()
    const user2Id = user2._id.toString()

    type Request = CreatePrivateChatDto
    type Response = CreatePrivateChatResponseDto

    const privateChatResponse = await asyncWebsocketEmit<Request, Response>(
      socket,
      'createPrivateChat',
      {
        whoRequestingId: user1Id,
        otherUserId: user2Id,
        text: 'Oi',
      },
    )

    const privateChatOnDatabase = await privateChatsRepository.findByUsersId({
      user1Id,
      user2Id,
    })

    expect(privateChatOnDatabase).toBeDefined()
    expect(privateChatOnDatabase._id.toString()).toEqual(
      privateChatResponse.chatId,
    )
    expect(privateChatOnDatabase.titleUser1).toEqual('mariadoe')

    expect(privateChatResponse).toBeDefined()
    expect(privateChatResponse).toEqual(
      expect.objectContaining({
        userId: user1._id.toString(),
        talkingUserId: user2._id.toString(),
        title: 'mariadoe',
      }),
    )
  })

  test('User send a message to other user in a already existing chat', async () => {
    const user1 = await userFactory.makeMongoUser()
    const user2 = await userFactory.makeMongoUser()

    const user1Id = user1._id.toString()

    const privateChat = await privateChatFactory.makeMongoPrivateChat({
      user1Id: user1._id,
      user2Id: user2._id,
      titleUser1: user2.username,
      titleUser2: user1.username,
    })

    type Request = CreateChatMessageDto

    await asyncWebsocketEmit<Request>(socket, 'sendMessage', {
      chatId: privateChat._id.toString(),
      whoRequestingId: user1Id,
      senderId: user1Id,
      text: 'Oi',
      chatType: ChatType.PRIVATE,
    })

    const chatMessagesOnDatabase = await chatMessagesRepository.fetchByChatId({
      chatId: privateChat._id.toString(),
      paginationParams: { pageIndex: 0, perPage: 10 },
    })

    expect(chatMessagesOnDatabase).toBeDefined()
    expect(chatMessagesOnDatabase.payload).toHaveLength(1)
  })
})
