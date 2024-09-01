import { Optional } from '@/shared/database/repositories/optional'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types, HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class PrivateChat {
  constructor(
    privateChat: Optional<PrivateChat, '_id' | 'createdAt' | 'updatedAt'>,
  ) {
    this._id = privateChat._id ?? new Types.ObjectId()
    this.titleUser1 = privateChat.titleUser1
    this.titleUser2 = privateChat.titleUser2
    this.user1Id = privateChat.user1Id
    this.user2Id = privateChat.user2Id
    this.createdAt = privateChat.createdAt ?? new Date()
  }

  _id: Types.ObjectId

  @Prop()
  titleUser1: string

  @Prop()
  titleUser2: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user1Id: Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user2Id: Types.ObjectId

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date
}

export type PrivateChatDocument = HydratedDocument<PrivateChat>

export const PrivateChatSchema = SchemaFactory.createForClass(PrivateChat)
