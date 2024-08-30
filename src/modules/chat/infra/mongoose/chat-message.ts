import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types, HydratedDocument } from 'mongoose'

export enum ChatType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}

@Schema({ timestamps: true })
export class ChatMessage {
  _id: Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  chatId: string

  @Prop()
  chatName?: string

  @Prop()
  chatDescription?: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  senderId: string

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
