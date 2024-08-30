import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types, HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class PrivateChat {
  _id: Types.ObjectId

  @Prop()
  titleUser1: string

  @Prop()
  titleUser2: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user1Id: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user2Id: string

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date
}

export type PrivateChatDocument = HydratedDocument<PrivateChat>

export const PrivateChatSchema = SchemaFactory.createForClass(PrivateChat)
