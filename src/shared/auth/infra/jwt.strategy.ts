import { PassportStrategy } from '@nestjs/passport'

import { Injectable } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'
import { EnvService } from '../../env/infra/env.service'

const tokenPayloadSchema = z.object({
  sub: z.string(),
})

export type UserPayload = z.infer<typeof tokenPayloadSchema>

function extractJwtFromWebSocketOrHttpRequest() {
  return function (request) {
    try {
      const tokenWithBearer = request.handshake.headers.authorization

      const token = tokenWithBearer.split(' ')[1]

      return token
    } catch {
      return ExtractJwt.fromAuthHeaderAsBearerToken()(request)
    }
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: extractJwtFromWebSocketOrHttpRequest(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: UserPayload) {
    return tokenPayloadSchema.parse(payload)
  }
}
