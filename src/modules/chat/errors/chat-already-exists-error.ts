import { MessageHelper } from '@/shared/errors/message-helper'
import { UnauthorizedException } from '@nestjs/common'

export class ChatAlreadyExistsError extends UnauthorizedException {
  constructor() {
    super(MessageHelper.CHAT_ALREADY_EXISTS_ERROR)
  }
}
