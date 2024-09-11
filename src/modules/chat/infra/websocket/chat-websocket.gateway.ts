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
import { ChatMessagesService } from '../../services/chat-messages.service'
import { PrivateChatsService } from '../../services/private-chats.service'
import { Body, Injectable, UseGuards, UsePipes } from '@nestjs/common'
import { PrivateChatPresenter } from './presenters/private-chat.presenter'
import { WebSocketResponse } from './utils/await-websocket-emit'
import { EventSubscriptions } from './events-subscriptions'
import { CurrentUser } from '@/shared/auth/infra/current-user-decorator'
import { UserPayload } from '@/shared/auth/infra/jwt.strategy'
import { JwtAuthGuard } from '@/shared/auth/infra/jwt-auth.guard'
import {
  CreatePrivateChatBodySchema,
  createPrivateChatBodySchemaBodyValidationPipe,
} from './validations/create-private-chat'
import {
  SendMessageBodySchema,
  sendMessageBodySchemaBodyValidationPipe,
} from './validations/send-message'
import {
  ForwardMessageBodySchema,
  forwardMessageBodySchemaBodyValidationPipe,
} from './validations/forward-message'
import {
  AnswerMessageBodySchema,
  answerMessageBodySchemaBodyValidationPipe,
} from './validations/answer-message'

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

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(EventSubscriptions.AnswerMessage)
  async handleAnswerMessage(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(answerMessageBodySchemaBodyValidationPipe)
    payload: AnswerMessageBodySchema,
  ): Promise<WebSocketResponse> {
    try {
      const whoRequestingId = user.sub

      await this.chatMessagesService.answerMessage({
        messageId: payload.messageId,
        senderId: whoRequestingId,
        text: payload.text,
        chatType: payload.chatType,
      })

      return { status: 'success' }
    } catch (error) {
      return { status: 'error', data: error }
    }
  }
}
