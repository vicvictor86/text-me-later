import { Module } from '@nestjs/common'

import { BcryptHasher } from './bcrypt-hasher'
import { JwtEncrypter } from './jwt-encrypter'
import { Encrypter } from '../domain/encrypter'
import { HashComparer } from '../domain/hash-comparer'
import { HashGenerator } from '../domain/hash-generator'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
