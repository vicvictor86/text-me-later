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
import { Body, Injectable, UseGuards, UsePipes } from '@nestjs/common'
import { PrivateChatPresenter } from './presenters/private-chat.presenter'
import { WebSocketResponse } from './utils/await-websocket-emit'
import { EventSubscriptions } from './events-subscriptions'
import { z } from 'zod'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'
import { ChatType } from '../mongoose/schemas/chat-message'
import { CurrentUser } from '@/shared/auth/infra/current-user-decorator'
import { UserPayload } from '@/shared/auth/infra/jwt.strategy'
import { JwtAuthGuard } from '@/shared/auth/infra/jwt-auth.guard'

const sendMessageBodySchema = z.object({
  text: z.string().min(1).max(3000),
  chatType: z.nativeEnum(ChatType),
  chatId: z.string(),
})

const sendMessageBodySchemaBodyValidationPipe = new ZodValidationPipe(
  sendMessageBodySchema,
)

export type SendMessageBodySchema = z.infer<typeof sendMessageBodySchema>

const createPrivateChatBodySchema = z.object({
  otherUserId: z.string(),
  text: z.string().min(1).max(3000),
})

const createPrivateChatBodySchemaBodyValidationPipe = new ZodValidationPipe(
  createPrivateChatBodySchema,
)

export type CreatePrivateChatBodySchema = z.infer<
  typeof createPrivateChatBodySchema
>

const forwardMessageBodySchema = z.object({
  chatType: z.nativeEnum(ChatType),
  messageId: z.string(),
  chatId: z.string(),
})

const forwardMessageBodySchemaBodyValidationPipe = new ZodValidationPipe(
  forwardMessageBodySchema,
)

export type ForwardMessageBodySchema = z.infer<typeof forwardMessageBodySchema>

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

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(EventSubscriptions.CreatePrivateChat)
  async handleCreateChat(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(createPrivateChatBodySchemaBodyValidationPipe)
    payload: CreatePrivateChatBodySchema,
  ): Promise<WebSocketResponse> {
    try {
      const whoRequestingId = user.sub

      const { otherUserId, text } = payload

      const privateChat = await this.privateChatsService.create({
        whoRequestingId,
        otherUserId,
        text,
      })

      return {
        status: 'success',
        data: PrivateChatPresenter.toHTTP(privateChat, whoRequestingId),
      }
    } catch (error) {
      return { status: 'error', data: error }
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(EventSubscriptions.SendMessage)
  async handleMessage(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(sendMessageBodySchemaBodyValidationPipe)
    payload: SendMessageBodySchema,
  ): Promise<WebSocketResponse> {
    try {
      const whoRequestingId = user.sub

      await this.chatMessagesService.create({
        chatType: payload.chatType,
        senderId: whoRequestingId,
        chatId: payload.chatId,
        text: payload.text,
      })

      return { status: 'success' }
    } catch (error) {
      return { status: 'error', data: error }
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(EventSubscriptions.ForwardMessage)
  async handleForwardMessage(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(forwardMessageBodySchemaBodyValidationPipe)
    payload: ForwardMessageBodySchema,
  ): Promise<WebSocketResponse> {
    try {
      const whoRequestingId = user.sub

      await this.chatMessagesService.forwardMessage({
        messageId: payload.messageId,
        senderId: whoRequestingId,
        chatId: payload.chatId,
        chatType: payload.chatType,
      })

      return { status: 'success' }
    } catch (error) {
      return { status: 'error', data: error }
    }
  }
}
