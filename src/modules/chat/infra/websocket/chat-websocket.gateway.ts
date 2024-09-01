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
import { Injectable } from '@nestjs/common'
import { CreatePrivateChatDto } from '../../dtos/create-private-chat.dto'
import { PrivateChatPresenter } from './presenters/private-chat.presenter'
import { DefaultResponse } from './utils/await-websocket-emit'
import { EventSubscriptions } from './events-subscriptions'

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

  afterInit(server: Server) {
    console.log('Chat Gateway initialized')
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
    this.clients.add(client)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
    this.clients.delete(client)
  }

  @SubscribeMessage(EventSubscriptions.CreatePrivateChat)
  async handleCreateChat(client: Socket, payload: CreatePrivateChatDto) {
    const privateChat = await this.privateChatsService.create(payload)

    return PrivateChatPresenter.toHTTP(privateChat, payload.whoRequestingId)
  }

  @SubscribeMessage(EventSubscriptions.SendMessage)
  async handleMessage(
    client: Socket,
    payload: CreateChatMessageDto,
  ): Promise<DefaultResponse> {
    try {
      await this.chatMessagesService.create(payload)
      return { status: 'success' }
    } catch (error) {
      return { status: 'error', message: error }
    }
  }
}
