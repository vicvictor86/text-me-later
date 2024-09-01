import { MessageHelper } from '@/shared/errors/message-helper'
import { ConflictException } from '@nestjs/common'

export class ChatAlreadyExistsError extends ConflictException {
  constructor() {
    super(MessageHelper.CHAT_ALREADY_EXISTS_ERROR)
  }
}
