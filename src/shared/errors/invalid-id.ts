import { BadRequestException } from '@nestjs/common'
import { MessageHelper } from './message-helper'

export class InvalidId extends BadRequestException {
  constructor() {
    super(MessageHelper.INVALID_ID)
  }
}
