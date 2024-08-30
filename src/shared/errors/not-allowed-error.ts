import { ForbiddenException } from '@nestjs/common'
import { MessageHelper } from './message-helper'

export class NotAllowedError extends ForbiddenException {
  constructor() {
    super(MessageHelper.NOT_ALLOWED_ERROR)
  }
}
