import { User } from '../../mongoose/schemas/user'

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      birthDate: user.birthDate.toISOString(),
      avatar: user.avatar,
      bios: user.bios,
      pronoun: user.pronoun,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    }
  }
}
