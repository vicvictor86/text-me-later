import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { UserFactory } from 'test/factories/make-user'
import { MongoUsersRepository } from '../../../repositories/mongo-users-repository'
import { AccountStatus } from '../../../mongoose/user'

describe('Authenticate User (e2e)', () => {
  let app: INestApplication
  let mongoUsersRepository: MongoUsersRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, MongoUsersRepository],
    }).compile()

    app = moduleRef.createNestApplication()
    mongoUsersRepository = moduleRef.get(MongoUsersRepository)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    const uniqueValue = Date.now()
    const username = `johndoe-${uniqueValue}`

    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'johndoe',
        username,
        email: `johndoe-${uniqueValue}@gmail.com`,
        phoneNumber: '123456789',
        birthDate: '1990-01-01',
        password: '123456',
        avatar: 'http://avatar.com',
        bios: 'My bio',
        pronoun: 'HE',
      })

    const user = await mongoUsersRepository.findByUsername(username)
    user.accountStatus = AccountStatus.ACTIVE
    await mongoUsersRepository.save(user)

    const response = await request(app.getHttpServer()).post('/sessions').send({
      username,
      password: '123456',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body.accessToken).toEqual(expect.any(String))
  })
})
