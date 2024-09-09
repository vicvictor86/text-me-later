import { InvalidId } from '@/shared/errors/invalid-id'
import { Types } from 'mongoose'

export class UniqueEntityId {
  public value: Types.ObjectId

  toString(): string {
    return this.value.toString()
  }

  toObjectId(): Types.ObjectId {
    return this.value
  }

  constructor(value?: string) {
    try {
      this.value = new Types.ObjectId(value) ?? new Types.ObjectId()
    } catch {
      throw new InvalidId()
    }
  }

  public equals(id: UniqueEntityId) {
    return id.toObjectId() === this.value
  }
}
