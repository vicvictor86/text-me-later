import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/shared/database/infra/database.module'
import { UsersRepository } from '@/modules/user/repositories/users-repository'

describe('Create User (e2e)', () => {
  let app: INestApplication
  let usersRepository: UsersRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile()

    app = moduleRef.createNestApplication()
    usersRepository = moduleRef.get(UsersRepository)

    await app.init()
  })

  test('[POST] /users', async () => {
    const uniqueValue = Date.now()
    const username = `johndoe-${uniqueValue}`

    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'johndoe',
      username,
      email: 'johndoe@gmail.com',
      phoneNumber: '123456789',
      birthDate: '1990-01-01',
      password: '123456',
      avatar: 'http://avatar.com',
      bios: 'My bio',
      pronoun: 'HE',
    })

    expect(response.statusCode).toBe(201)

    const user = await usersRepository.findByUsername(username)

    expect(user).toBeTruthy()
    expect(user).toEqual(
      expect.objectContaining({
        username,
      }),
    )
  })
})
