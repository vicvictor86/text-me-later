import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { EnvService } from '../../env/infra/env.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtStrategy } from './jwt.strategy'
import { EnvModule } from '@/shared/env/infra/env.module'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [ConfigService],
      global: true,
      useFactory(config: EnvService) {
        const privateKey = config.get('JWT_PRIVATE_KEY')
        const publicKey = config.get('JWT_PUBLIC_KEY')

        return {
          signOptions: { algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        }
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    EnvService,
    JwtStrategy,
  ],
})
export class AuthModule {}
