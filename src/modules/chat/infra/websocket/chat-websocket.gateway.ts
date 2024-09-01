/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
import { CreateChatMessageDto } from '../../dtos/create-chat-message.dto'
import { ChatMessagesService } from '../../services/chat-messages.service'
import { PrivateChatsService } from '../../services/private-chats.service'
import { Body, Injectable, UsePipes } from '@nestjs/common'
import { CreatePrivateChatDto } from '../../dtos/create-private-chat.dto'
import { PrivateChatPresenter } from './presenters/private-chat.presenter'
import { WebSocketResponse } from './utils/await-websocket-emit'
import { EventSubscriptions } from './events-subscriptions'
import { z } from 'zod'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'
import { ChatType } from '../mongoose/schemas/chat-message'

const sendMessageBodySchema = z.object({
  whoRequestingId: z.string(),
  senderId: z.string(),
  chatId: z.string(),
  text: z.string().min(1).max(3000),
  chatType: z.nativeEnum(ChatType),
})

const sendMessageBodySchemaBodyValidationPipe = new ZodValidationPipe(
  sendMessageBodySchema,
)

const createPrivateChatBodySchema = z.object({
  whoRequestingId: z.string(),
  otherUserId: z.string(),
  text: z.string().min(1).max(3000),
})

const createPrivateChatBodySchemaBodyValidationPipe = new ZodValidationPipe(
  createPrivateChatBodySchema,
)

@WebSocketGateway()
@Injectable()
export class ChatWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private chatMessagesService: ChatMessagesService,
    private privateChatsService: PrivateChatsService,
  ) {}

  private clients: Set<Socket> = new Set()
  public static subscriberMessages: string[] = []

  @WebSocketServer() server: Server

  afterInit(server: Server) {}

  handleConnection(client: Socket) {
    this.clients.add(client)
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client)
  }

  @UsePipes(createPrivateChatBodySchemaBodyValidationPipe)
  @SubscribeMessage(EventSubscriptions.CreatePrivateChat)
  async handleCreateChat(
    client: Socket,
    @Body() payload: CreatePrivateChatDto,
  ): Promise<WebSocketResponse> {
    try {
      const privateChat = await this.privateChatsService.create(payload)
      return {
        status: 'success',
        data: PrivateChatPresenter.toHTTP(privateChat, payload.whoRequestingId),
      }
    } catch (error) {
      return { status: 'error', data: error }
    }
  }

  @UsePipes(sendMessageBodySchemaBodyValidationPipe)
  @SubscribeMessage(EventSubscriptions.SendMessage)
  async handleMessage(
    client: Socket,
    @Body() payload: CreateChatMessageDto,
  ): Promise<WebSocketResponse> {
    try {
      await this.chatMessagesService.create(payload)
      return { status: 'success' }
    } catch (error) {
      return { status: 'error', data: error }
    }
  }
}
