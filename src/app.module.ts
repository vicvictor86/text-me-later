import { Module } from '@nestjs/common'
import { AuthModule } from './shared/auth/infra/auth.module'
import { EnvModule } from './shared/env/infra/env.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { envSchema } from './shared/env/infra/env'
import { MongooseModule } from '@nestjs/mongoose'
import { EnvService } from './shared/env/infra/env.service'
import { DatabaseModule } from './shared/database/infra/database.module'
import { HttpModule } from './shared/http/http.module'
import { WebsocketsGatewayModule } from './shared/websocket/websockets.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [EnvModule],
      inject: [ConfigService],
      useFactory: async (env: EnvService) => ({
        uri:
          env.get('NODE_ENV') === 'test'
            ? env.get('MONGO_URI_TEST')
            : env.get('MONGO_URI'),
      }),
    }),
    WebsocketsGatewayModule,
    AuthModule,
    DatabaseModule,
    EnvModule,
    HttpModule,
  ],
})
export class AppModule {}
