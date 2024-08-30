import { MessageHelper } from '@/shared/errors/message-helper'
import { ServiceError } from '@/shared/errors/service-error'
import { UnauthorizedException } from '@nestjs/common'

export class WrongCredentialsError
  extends UnauthorizedException
  implements ServiceError
{
  constructor() {
    super(MessageHelper.WRONG_CREDENTIALS_ERROR)
  }
}
