import { Types } from 'mongoose'

export function makeObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id)
}
