import { CreateNotificationDto } from '../dtos/create-notification.dto'
import { Notification } from '../entities/notification'

export abstract class NotificationsRepository {
  abstract findById(id: string): Promise<Notification | null>
  abstract create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification>
}
