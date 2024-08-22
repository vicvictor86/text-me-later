import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { UserFactory } from 'test/factories/make-user'

describe('Find User By Username (e2e)', () => {
  let app: INestApplication
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)

    await app.init()
  })

  test('[POST] /users', async () => {
    await userFactory.makeMongoUser({ username: 'johndoe' })

    const response = await request(app.getHttpServer()).get('/users').send({
      username: 'johndoe',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body.user).toBeTruthy()
    expect(response.body.user).toEqual(
      expect.objectContaining({
        username: 'johndoe',
      }),
    )
  })
})
