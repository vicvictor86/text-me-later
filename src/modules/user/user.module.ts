import { Module } from '@nestjs/common'
import { CreateUserController } from './infra/http/controllers/create-user.controller'
import { UsersService } from './services/users.service'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { FindUserByUsernameController } from './infra/http/controllers/find-user-by-username.controller'
import { CryptographyModule } from '@/shared/cryptography/infra/cryptography.module'
import { AuthenticateUserController } from './infra/http/controllers/authenticate-user.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateUserController,
    FindUserByUsernameController,
    AuthenticateUserController,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
