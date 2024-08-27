import { AccountStatus, Pronoun } from '../infra/mongoose/user'

export interface CreateUserDto {
  name: string
  username: string
  email: string
  phoneNumber: string
  pronoun: Pronoun
  password: string
  birthDate: Date
  avatar: string
  accountStatus: AccountStatus
  bios: string
}
