export interface CreateNotificationDto {
  recipientEmail: string
  title: string
  content: string
  html?: string | null
}
