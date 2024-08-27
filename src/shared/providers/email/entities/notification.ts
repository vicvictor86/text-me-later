import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

@Schema({ timestamps: true })
export class Notification {
  _id: Types.ObjectId

  @Prop({ required: true })
  recipientEmail: string

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  content: string

  @Prop()
  html?: string | null

  @Prop({ type: Date, default: Date.now })
  createdAt: Date
}

export type NotificationDocument = HydratedDocument<Notification>

export const NotificationSchema = SchemaFactory.createForClass(Notification)
