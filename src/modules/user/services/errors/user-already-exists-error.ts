import { MessageHelper } from '@/shared/errors/message-helper'
import { ServiceError } from '@/shared/errors/service-error'
import { ConflictException } from '@nestjs/common'

export class UserAlreadyExistsError
  extends ConflictException
  implements ServiceError
{
  constructor(reason: string) {
    super(MessageHelper.USER_ALREADY_EXISTS_ERROR(reason))
  }
}
