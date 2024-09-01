import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/infra/auth.module'
import { CryptographyModule } from '../cryptography/infra/cryptography.module'
import { DatabaseModule } from '../database/infra/database.module'
import { HelloController } from './controllers/hello.controller'
import { UserModule } from '@/modules/user/user.module'
import { ChatModule } from '@/modules/chat/chat.module'

@Module({
  imports: [
    DatabaseModule,
    CryptographyModule,
    AuthModule,
    UserModule,
    ChatModule,
  ],
  controllers: [HelloController],
  providers: [],
})
export class HttpModule {}
