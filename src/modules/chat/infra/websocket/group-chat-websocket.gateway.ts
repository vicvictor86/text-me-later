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
import { GroupChatsService } from '../../services/group-chats.service'
import { Body, Injectable, UseFilters, UseGuards } from '@nestjs/common'
import { GroupChatPresenter } from './presenters/group-chat.presenter'
import { WebSocketResponse } from './utils/await-websocket-emit'
import { EventSubscriptions } from './events-subscriptions'
import { CurrentUser } from '@/shared/auth/infra/current-user-decorator'
import { UserPayload } from '@/shared/auth/infra/jwt.strategy'
import { JwtAuthGuard } from '@/shared/auth/infra/jwt-auth.guard'
import {
  CreateGroupChatBodySchema,
  createGroupChatBodySchemaBodyValidationPipe,
} from './validations/create-group-chat'
import { WebsocketExceptionsFilter } from '@/shared/filters/web-socket-exceptions-filter'

@WebSocketGateway()
@UseFilters(WebsocketExceptionsFilter)
@Injectable()
export class GroupChatWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private groupChatsService: GroupChatsService) {}

  private clients: Set<Socket> = new Set()

  @WebSocketServer() server: Server

  afterInit(server: Server) {}

  handleConnection(client: Socket) {
    this.clients.add(client)
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(EventSubscriptions.CreateGroupChat)
  async handleCreateGroupChat(
    client: Socket,
    @CurrentUser() user: UserPayload,
    @Body(createGroupChatBodySchemaBodyValidationPipe)
    payload: CreateGroupChatBodySchema,
  ): Promise<WebSocketResponse> {
    const whoRequestingId = user.sub

    const { membersId, name, description } = payload

    const groupChat = await this.groupChatsService.create({
      whoRequestingId,
      membersId,
      name,
      description,
    })

    return {
      status: 'success',
      data: GroupChatPresenter.toHTTP(groupChat, whoRequestingId),
    }
  }
}
