import { compare, hash } from 'bcryptjs'
import { HashGenerator } from '../domain/hash-generator'
import { HashComparer } from '../domain/hash-comparer'

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
