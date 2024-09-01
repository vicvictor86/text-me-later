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

  @WebSocketServer() server: Server

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  @SubscribeMessage('createPrivateChat')
  async handleCreateChat(client: Socket, payload: CreatePrivateChatDto) {
    console.log(`Chat from client ${client.id}: ${payload}`)
    const privateChat = await this.privateChatsService.create(payload)

    return PrivateChatPresenter.toHTTP(privateChat, payload.whoRequestingId)
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: CreateChatMessageDto,
  ): Promise<void> {
    console.log(`Message from client ${client.id}: ${payload}`)
    await this.chatMessagesService.create(payload)
  }
}
