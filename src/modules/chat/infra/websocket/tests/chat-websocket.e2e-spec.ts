import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { Socket, connect } from 'socket.io-client'
import { UserFactory } from 'test/factories/make-user'
import { PrivateChatsRepository } from '../../../repositories/private-chats-repository'
import { EnvModule } from '@/shared/env/infra/env.module'
import { EnvService } from '@/shared/env/infra/env.service'
import {
  asyncWebsocketEmit,
  WebSocketResponse,
} from '../utils/await-websocket-emit'
import { CreatePrivateChatDto } from '@/modules/chat/dtos/create-private-chat.dto'
import { CreatePrivateChatResponseDto } from '@/modules/chat/dtos/create-private-chat-response.dto'
import { PrivateChatFactory } from 'test/factories/make-private-chat'
import { ChatType } from '../../mongoose/schemas/chat-message'
import { ChatMessagesRepository } from '@/modules/chat/repositories/chat-messages-repository'
import { EventSubscriptions } from '../events-subscriptions'
import { User } from '@/modules/user/infra/mongoose/schemas/user'
import { JwtService } from '@nestjs/jwt'
import { CryptographyModule } from '@/shared/cryptography/infra/cryptography.module'
import { UniqueEntityId } from '@/shared/database/repositories/unique-entity-id'

import { ChatMessageFactory } from 'test/factories/make-chat-message'
import { SendMessageBodySchema } from '../validations/send-message'
import { ForwardMessageBodySchema } from '../validations/forward-message'
import { AnswerMessageBodySchema } from '../validations/answer-message'
import { CreateGroupChatDto } from '@/modules/chat/dtos/create-group-chat.dto'
import { CreateGroupChatResponseDto } from '@/modules/chat/dtos/create-group-chat-response.dto'
import { GroupChatsRepository } from '@/modules/chat/repositories/group-chats-repository'

describe('Chat Web Socket Test (e2e)', () => {
  let app: INestApplication
  let socket: Socket
  let chatMessagesRepository: ChatMessagesRepository
  let privateChatsRepository: PrivateChatsRepository
  let userFactory: UserFactory
  let privateChatFactory: PrivateChatFactory
  let chatMessageFactory: ChatMessageFactory
  let groupChatsRepository: GroupChatsRepository

  let jwt: JwtService

  let user1: User

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, EnvModule, CryptographyModule],
      providers: [
        UserFactory,
        PrivateChatFactory,
        ChatMessageFactory,
        EnvService,
      ],
    }).compile()

    const envService = moduleRef.get(EnvService)

    const port = envService.get('PORT')

    app = moduleRef.createNestApplication()

    privateChatsRepository = moduleRef.get(PrivateChatsRepository)
    chatMessagesRepository = moduleRef.get(ChatMessagesRepository)

    userFactory = moduleRef.get(UserFactory)
    privateChatFactory = moduleRef.get(PrivateChatFactory)
    chatMessageFactory = moduleRef.get(ChatMessageFactory)
    groupChatsRepository = moduleRef.get(GroupChatsRepository)

    jwt = moduleRef.get(JwtService)

    await app.init()

    app.listen(port)

    user1 = await userFactory.makeMongoUser({ username: 'johndoe' })
    const accessToken = jwt.sign({ sub: user1._id.toString() })

    socket = connect(`http://localhost:${port}`, {
      forceNew: true,
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  })

  afterAll(async () => {
    await app.close()
    socket.close()
  })

  test('User send first message to other user', async () => {
    const user2 = await userFactory.makeMongoUser({ username: 'mariadoe' })

    type Request = Omit<CreatePrivateChatDto, 'whoRequestingId'>
    type Response = WebSocketResponse<CreatePrivateChatResponseDto>

    const privateChatResponse = await asyncWebsocketEmit<Request, Response>(
      socket,
      EventSubscriptions.CreatePrivateChat,
      {
        otherUserId: user2._id.toString(),
        text: 'Oi',
      },
    )

    expect(privateChatResponse.status).toEqual('success')

    const privateChatOnDatabase = await privateChatsRepository.findByUsersId({
      user1Id: new UniqueEntityId(user1._id.toString()),
      user2Id: new UniqueEntityId(user2._id.toString()),
    })

    expect(privateChatOnDatabase).toBeTruthy()

    if (!privateChatOnDatabase) {
      throw new Error('Private chat not found')
    }

    if (!privateChatResponse.data) {
      throw new Error('Private chat response not found')
    }

    expect(privateChatOnDatabase._id.toString()).toEqual(
      privateChatResponse.data.chatId,
    )
    expect(privateChatOnDatabase.titleUser1).toEqual('mariadoe')

    expect(privateChatResponse).toBeDefined()
    expect(privateChatResponse.status).toEqual('success')
    expect(privateChatResponse.data).toEqual(
      expect.objectContaining({
        userId: user1._id.toString(),
        talkingUserId: user2._id.toString(),
        title: 'mariadoe',
      }),
    )
  })

  test('User send a message to other user in a already existing chat', async () => {
    const user2 = await userFactory.makeMongoUser()

    const privateChat = await privateChatFactory.makeMongoPrivateChat({
      user1Id: user1._id,
      user2Id: user2._id,
      titleUser1: user2.username,
      titleUser2: user1.username,
    })

    type Request = SendMessageBodySchema

    await asyncWebsocketEmit<Request, WebSocketResponse>(
      socket,
      EventSubscriptions.SendMessage,
      {
        chatId: privateChat._id.toString(),
        text: 'Oi',
        chatType: ChatType.PRIVATE,
      },
    )

    const chatMessagesOnDatabase = await chatMessagesRepository.fetchByChatId({
      chatId: privateChat._id.toString(),
      paginationParams: { pageIndex: 0, perPage: 10 },
    })

    expect(chatMessagesOnDatabase).toBeDefined()
    expect(chatMessagesOnDatabase.payload).toHaveLength(1)
  })

  test('User forward a message to other user in a already existing chat', async () => {
    const user2 = await userFactory.makeMongoUser()

    const privateChat = await privateChatFactory.makeMongoPrivateChat({
      user1Id: user1._id,
      user2Id: user2._id,
      titleUser1: user2.username,
      titleUser2: user1.username,
    })

    const message = await chatMessageFactory.makeMongoChatMessage({
      chatId: privateChat._id,
      senderId: user2._id,
      text: 'Oi',
      chatType: ChatType.PRIVATE,
    })

    type Request = ForwardMessageBodySchema

    await asyncWebsocketEmit<Request, WebSocketResponse>(
      socket,
      EventSubscriptions.ForwardMessage,
      {
        chatId: privateChat._id.toString(),
        messageId: message._id.toString(),
        chatType: ChatType.PRIVATE,
      },
    )

    const chatMessagesOnDatabase = await chatMessagesRepository.fetchByChatId({
      chatId: privateChat._id.toString(),
      paginationParams: { pageIndex: 0, perPage: 10 },
    })

    expect(chatMessagesOnDatabase).toBeDefined()
    expect(chatMessagesOnDatabase.payload).toHaveLength(2)
    expect(chatMessagesOnDatabase.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: 'Oi',
          senderId: user1._id,
          isForwarded: true,
        }),
      ]),
    )
  })

  test('User answer a message to other user in a already existing chat', async () => {
    const user2 = await userFactory.makeMongoUser()

    const privateChat = await privateChatFactory.makeMongoPrivateChat({
      user1Id: user1._id,
      user2Id: user2._id,
      titleUser1: user2.username,
      titleUser2: user1.username,
    })

    const message = await chatMessageFactory.makeMongoChatMessage({
      chatId: privateChat._id,
      senderId: user2._id,
      text: 'Oi',
      chatType: ChatType.PRIVATE,
    })

    type Request = AnswerMessageBodySchema

    await asyncWebsocketEmit<Request, WebSocketResponse>(
      socket,
      EventSubscriptions.AnswerMessage,
      {
        messageId: message._id.toString(),
        chatType: ChatType.PRIVATE,
        text: 'answer-message',
      },
    )

    const chatMessagesOnDatabase = await chatMessagesRepository.fetchByChatId({
      chatId: privateChat._id.toString(),
      paginationParams: { pageIndex: 0, perPage: 10 },
    })

    expect(chatMessagesOnDatabase).toBeDefined()
    expect(chatMessagesOnDatabase.payload).toHaveLength(2)
    expect(chatMessagesOnDatabase.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: 'answer-message',
          senderId: user1._id,
          answeringTo: message._id,
        }),
      ]),
    )
  })

  test('User create a group chat', async () => {
    const user2 = await userFactory.makeMongoUser()

    type Request = Omit<CreateGroupChatDto, 'whoRequestingId'>
    type Response = WebSocketResponse<CreateGroupChatResponseDto>

    const groupChatResponse = await asyncWebsocketEmit<Request, Response>(
      socket,
      EventSubscriptions.CreateGroupChat,
      {
        membersId: [user2._id.toString()],
        name: 'Group Chat',
        description: 'Group Chat Description',
      },
    )

    expect(groupChatResponse.status).toEqual('success')

    const groupChatOnDatabase = await groupChatsRepository.fetchByUserId({
      paginationParams: { pageIndex: 0, perPage: 10 },
      userId: user1._id.toString(),
    })

    expect(groupChatOnDatabase).toBeTruthy()

    if (!groupChatOnDatabase) {
      throw new Error('Private chat not found')
    }

    if (!groupChatResponse.data) {
      throw new Error('Private chat response not found')
    }

    expect(groupChatOnDatabase.meta.totalCount).toEqual(1)
    expect(groupChatOnDatabase.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Group Chat',
          description: 'Group Chat Description',
          members: expect.arrayContaining([user1._id, user2._id]),
          admins: expect.arrayContaining([user1._id]),
        }),
      ]),
    )

    expect(groupChatResponse).toBeDefined()
    expect(groupChatResponse.status).toEqual('success')
    expect(groupChatResponse.data).toEqual(
      expect.objectContaining({
        name: 'Group Chat',
        description: 'Group Chat Description',
        membersId: expect.arrayContaining([
          user1._id.toString(),
          user2._id.toString(),
        ]),
        adminsId: expect.arrayContaining([user1._id.toString()]),
      }),
    )
  })
})
