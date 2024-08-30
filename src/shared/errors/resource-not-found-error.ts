import { NotFoundException } from '@nestjs/common'
import { MessageHelper } from './message-helper'

export class ResourceNotFoundError extends NotFoundException {
  constructor(message: string) {
    super(MessageHelper.RESOURCE_NOT_FOUND_ERROR(message))
  }
}
