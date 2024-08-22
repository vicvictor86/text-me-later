import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/infra/auth.module'
import { CryptographyModule } from '../cryptography/infra/cryptography.module'
import { DatabaseModule } from '../database/infra/database.module'
import { HelloController } from './controllers/hello.controller'
import { UserModule } from '@/modules/user/user.module'

@Module({
  imports: [DatabaseModule, CryptographyModule, AuthModule, UserModule],
  controllers: [HelloController],
  providers: [],
})
export class HttpModule {}
