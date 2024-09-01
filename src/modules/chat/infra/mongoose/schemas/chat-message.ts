import { Optional } from '@/shared/database/repositories/optional'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types, HydratedDocument } from 'mongoose'

export enum ChatType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}

@Schema({ timestamps: true })
export class ChatMessage {
  constructor(chatMessage: Optional<ChatMessage, '_id' | 'createdAt'>) {
    this._id = chatMessage._id ?? new Types.ObjectId()
    this.chatId = chatMessage.chatId
    this.senderId = chatMessage.senderId
    this.text = chatMessage.text
    this.chatType = chatMessage.chatType
    this.createdAt = chatMessage.createdAt ?? new Date()
  }

  _id: Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  chatId: Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId

  @Prop()
  text: string

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  deletedBy?: string[]

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  readBy?: string[]

  @Prop({
    type: String,
    enum: Object.values(ChatType),
    default: ChatType.PRIVATE,
  })
  chatType: ChatType

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date
}

export type ChatMessageDocument = HydratedDocument<ChatMessage>

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage)
