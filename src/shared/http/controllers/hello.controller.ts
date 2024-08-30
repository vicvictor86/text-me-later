import { Public } from '@/shared/auth/infra/public'
import { Controller, Get } from '@nestjs/common'

@Controller('/')
@Public()
export class HelloController {
  constructor() {}

  @Get()
  async handle() {
    return {
      message: 'Welcome to Text Me Later API!',
      tip: 'Use /docs to access the API documentation 📑',
    }
  }
}
