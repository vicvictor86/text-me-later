import { Optional } from '@/shared/database/repositories/optional'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types, HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class GroupChat {
  constructor(
    groupChat: Optional<GroupChat, '_id' | 'createdAt' | 'updatedAt'>,
  ) {
    this._id = groupChat._id ?? new Types.ObjectId()
    this.name = groupChat.name
    this.description = groupChat.description
    this.members = groupChat.members
    this.admins = groupChat.admins
    this.createdAt = groupChat.createdAt ?? new Date()
  }

  _id: Types.ObjectId

  @Prop()
  name: string

  @Prop()
  description?: string

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true })
  members: Types.ObjectId[]

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true })
  admins: Types.ObjectId[]

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date
}

export type GroupChatDocument = HydratedDocument<GroupChat>

export const GroupChatSchema = SchemaFactory.createForClass(GroupChat)
