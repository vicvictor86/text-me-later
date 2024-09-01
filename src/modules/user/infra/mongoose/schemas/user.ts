import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, HydratedDocument } from 'mongoose'

export enum Pronoun {
  HE = 'HE',
  SHE = 'SHE',
  THEY = 'THEY',
  OTHER = 'OTHER',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  WAITING_FOR_EMAIL = 'WAITING_FOR_EMAIL',
}

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId

  @Prop()
  name: string

  @Prop({ required: true, unique: true })
  username: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  phoneNumber: string

  @Prop({
    type: String,
    default: Pronoun.OTHER,
    enum: Object.values(Pronoun),
  })
  pronoun: Pronoun

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  birthDate: Date

  @Prop()
  avatar: string

  @Prop({
    type: String,
    default: AccountStatus.WAITING_FOR_EMAIL,
    enum: Object.values(AccountStatus),
  })
  accountStatus: AccountStatus

  @Prop()
  bios: string

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date
}

export type UserDocument = HydratedDocument<User>

export const UserSchema = SchemaFactory.createForClass(User)
