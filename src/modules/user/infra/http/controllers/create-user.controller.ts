import { UsersService } from '@/modules/user/services/users.service'
import { Public } from '@/shared/auth/infra/public'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { z } from 'zod'
import { AccountStatus, Pronoun } from '../../mongoose/schemas/user'
import { ApiTags } from '@nestjs/swagger'
import { CreateUserDto } from '@/modules/user/dtos/create-user.dto'

const createUserBodySchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  birthDate: z.coerce.date(),
  password: z.string(),
  avatar: z.string().optional(),
  bios: z.string().optional(),
  pronoun: z.nativeEnum(Pronoun).optional().default(Pronoun.OTHER),
})

const bodyValidationPipe = new ZodValidationPipe(createUserBodySchema)

@ApiTags('user')
@Controller('/users')
@Public()
export class CreateUserController {
  constructor(private usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handle(@Body(bodyValidationPipe) body: CreateUserDto) {
    const {
      name,
      email,
      phoneNumber,
      birthDate,
      username,
      password,
      avatar,
      bios,
      pronoun,
    } = body

    await this.usersService.create({
      name,
      username,
      email,
      phoneNumber,
      birthDate,
      password,
      accountStatus: AccountStatus.WAITING_FOR_EMAIL,
      avatar,
      bios,
      pronoun,
    })
  }
}
