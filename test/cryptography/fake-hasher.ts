import { HashComparer } from '@/shared/cryptography/domain/hash-comparer'
import { HashGenerator } from '@/shared/cryptography/domain/hash-generator'

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return `${plain}-hashed`
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat('-hashed') === hash
  }
}
