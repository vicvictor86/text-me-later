import { UsersService } from '@/modules/user/services/users.service'
import { Public } from '@/shared/auth/infra/public'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'
import { Body, Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { z } from 'zod'
import { UserPresenter } from '../presenters/user.presenter'

const findUserByUsernameBodySchema = z.object({
  username: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(findUserByUsernameBodySchema)

type FindUserByUsernameBodySchema = z.infer<typeof findUserByUsernameBodySchema>

@Controller('/users')
@Public()
export class FindUserByUsernameController {
  constructor(private usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handle(@Body(bodyValidationPipe) body: FindUserByUsernameBodySchema) {
    const { username } = body

    const user = await this.usersService.findByUsername(username)

    return { user: UserPresenter.toHTTP(user) }
  }
}
