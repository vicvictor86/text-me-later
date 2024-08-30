import { AuthenticateUserDto } from '@/modules/user/dtos/authenticate-user.dto'
import { UsersService } from '@/modules/user/services/users.service'
import { Public } from '@/shared/auth/infra/public'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { z } from 'zod'

const authenticateUserBodySchema = z.object({
  username: z.string(),
  password: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(authenticateUserBodySchema)

@Controller('/sessions')
@Public()
export class AuthenticateUserController {
  constructor(private usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(@Body(bodyValidationPipe) body: AuthenticateUserDto) {
    const { username, password } = body

    const { accessToken } = await this.usersService.authenticate({
      username,
      password,
    })

    return { accessToken }
  }
}
