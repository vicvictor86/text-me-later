import {
  EmailProvider,
  SendEmailMessageProps,
} from '@/shared/providers/email/email-provider'

export class FakeEmailProvider extends EmailProvider {
  public emails: SendEmailMessageProps[] = []

  async sendEmail(props: SendEmailMessageProps): Promise<void> {
    this.emails.push(props)
  }
}
