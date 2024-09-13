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
import {
  Body,
  Injectable,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import { WebSocketResponse } from './utils/await-websocket-emit'
import { EventSubscriptions } from './events-subscriptions'
import { CurrentUser } from '@/shared/auth/infra/current-user-decorator'
import { UserPayload } from '@/shared/auth/infra/jwt.strategy'
import { JwtAuthGuard } from '@/shared/auth/infra/jwt-auth.guard'
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
import { WebsocketExceptionsFilter } from '@/shared/filters/web-socket-exceptions-filter'

@WebSocketGateway()
@UseFilters(WebsocketExceptionsFilter)
@Injectable()
export class ChatMessagesWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private chatMessagesService: ChatMessagesService) {}

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
  @SubscribeMessage(EventSubscriptions.SendMessage)
  async handleMessage(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(sendMessageBodySchemaBodyValidationPipe)
    payload: SendMessageBodySchema,
  ): Promise<WebSocketResponse> {
    const whoRequestingId = user.sub

    await this.chatMessagesService.create({
      chatType: payload.chatType,
      senderId: whoRequestingId,
      chatId: payload.chatId,
      text: payload.text,
    })

    return { status: 'success' }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(EventSubscriptions.ForwardMessage)
  async handleForwardMessage(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(forwardMessageBodySchemaBodyValidationPipe)
    payload: ForwardMessageBodySchema,
  ): Promise<WebSocketResponse> {
    const whoRequestingId = user.sub

    await this.chatMessagesService.forwardMessage({
      messageId: payload.messageId,
      senderId: whoRequestingId,
      chatId: payload.chatId,
      chatType: payload.chatType,
    })

    return { status: 'success' }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(EventSubscriptions.AnswerMessage)
  async handleAnswerMessage(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(answerMessageBodySchemaBodyValidationPipe)
    payload: AnswerMessageBodySchema,
  ): Promise<WebSocketResponse> {
    const whoRequestingId = user.sub

    await this.chatMessagesService.answerMessage({
      messageId: payload.messageId,
      senderId: whoRequestingId,
      text: payload.text,
      chatType: payload.chatType,
    })

    return { status: 'success' }
  }
}
