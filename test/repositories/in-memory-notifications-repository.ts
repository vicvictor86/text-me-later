import { CreateNotificationDto } from '@/shared/providers/email/dtos/create-notification.dto'
import { Notification } from '@/shared/providers/email/entities/notification'
import { NotificationsRepository } from '@/shared/providers/email/repositories/notifications-repository'
import { Types } from 'mongoose'

export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  async create({
    content,
    recipientEmail,
    title,
    html,
  }: CreateNotificationDto): Promise<Notification> {
    const notification: Notification = {
      _id: new Types.ObjectId(),
      content,
      recipientEmail,
      title,
      html,
      createdAt: new Date(),
    }

    this.items.push(notification)

    return notification
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = this.items.find(
      (notification) => notification._id.toString() === id,
    )

    return notification || null
  }
}
