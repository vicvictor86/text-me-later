export type SendEmailMessageProps = {
  to: string
  subject: string
  message: string
  html?: string | null
}

export abstract class EmailProvider {
  abstract sendEmail(props: SendEmailMessageProps): Promise<void>
}
