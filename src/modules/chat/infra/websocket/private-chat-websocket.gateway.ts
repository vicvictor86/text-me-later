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
import { PrivateChatsService } from '../../services/private-chats.service'
import { Body, Injectable, UseFilters, UseGuards } from '@nestjs/common'
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
import { WebsocketExceptionsFilter } from '@/shared/filters/web-socket-exceptions-filter'

@WebSocketGateway()
@UseFilters(WebsocketExceptionsFilter)
@Injectable()
export class PrivateChatWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private privateChatsService: PrivateChatsService) {}

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
  async handleCreatePrivateChat(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(createPrivateChatBodySchemaBodyValidationPipe)
    payload: CreatePrivateChatBodySchema,
  ): Promise<WebSocketResponse> {
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
  }
}
