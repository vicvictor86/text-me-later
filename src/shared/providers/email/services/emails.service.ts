import { Injectable, NotFoundException } from '@nestjs/common'
import { NotificationsRepository } from '../repositories/notifications-repository'
import { CreateNotificationDto } from '../dtos/create-notification.dto'
import { EmailProvider } from '../email-provider'
import { Notification } from '../entities/notification'

@Injectable()
export class EmailsService {
  constructor(
    private notificationsRepository: NotificationsRepository,
    private emailProvider: EmailProvider,
  ) {}

  async create({
    content,
    recipientEmail,
    title,
    html,
  }: CreateNotificationDto): Promise<Notification> {
    const notification = await this.notificationsRepository.create({
      content,
      recipientEmail,
      title,
      html,
    })

    await this.emailProvider.sendEmail({
      to: recipientEmail,
      subject: title,
      message: content,
      html,
    })

    return notification
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.notificationsRepository.findById(id)

    if (!notification) {
      throw new NotFoundException('Notification not found')
    }

    return notification
  }
}
