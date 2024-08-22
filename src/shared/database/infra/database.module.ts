import { User, UserSchema } from '@/modules/user/infra/mongoose/user'
import { MongoUsersRepository } from '@/modules/user/infra/repositories/mongo-users-repository'
import { UsersRepository } from '@/modules/user/repositories/users-repository'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: UsersRepository,
      useClass: MongoUsersRepository,
    },
  ],
  exports: [MongooseModule, UsersRepository],
})
export class DatabaseModule {}
