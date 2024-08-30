import { Module } from '@nestjs/common'
import { CryptographyModule } from '@/shared/cryptography/infra/cryptography.module'
import { PrivateChatsService } from './services/private-chats.service'
import { DatabaseModule } from '@/shared/database/infra/database.module'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [],
  providers: [PrivateChatsService],
  exports: [PrivateChatsService],
})
export class UserModule {}
