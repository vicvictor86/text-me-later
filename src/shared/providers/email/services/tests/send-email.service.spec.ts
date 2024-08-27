import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { EmailProvider } from '../../email-provider'
import { EmailsService } from '../emails.service'
import { FakeEmailProvider } from 'test/providers/fake-email-provider'

let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let fakeEmailProvider: EmailProvider
let sut: EmailsService

describe('Send Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    fakeEmailProvider = new FakeEmailProvider()
    sut = new EmailsService(inMemoryNotificationsRepository, fakeEmailProvider)
  })

  it('should be able to send a notification', async () => {
    const result = await sut.create({
      recipientEmail: 'email@mail.com',
      title: 'Título da notificação',
      content: 'Conteúdo da notificação',
    })

    expect(result).toBeTruthy()
    expect(inMemoryNotificationsRepository.items[0].content).toEqual(
      result.content,
    )
  })
})
