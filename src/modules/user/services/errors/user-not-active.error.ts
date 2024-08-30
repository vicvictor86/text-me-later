import { MessageHelper } from '@/shared/errors/message-helper'
import { ServiceError } from '@/shared/errors/service-error'
import { UnauthorizedException } from '@nestjs/common'

export class UserNotActiveError
  extends UnauthorizedException
  implements ServiceError
{
  constructor() {
    super(MessageHelper.USER_NOT_ACTIVE_ERROR)
  }
}
