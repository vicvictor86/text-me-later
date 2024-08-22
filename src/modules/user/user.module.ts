import { Module } from '@nestjs/common'
import { CreateUserController } from './infra/http/controllers/create-user.controller'
import { UsersService } from './services/users.service'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { FindUserByUsernameController } from './infra/http/controllers/find-user-by-username.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [CreateUserController, FindUserByUsernameController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
