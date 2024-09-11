import { z } from 'zod'
import { ChatType } from '../../mongoose/schemas/chat-message'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'

const sendMessageBodySchema = z.object({
  text: z.string().min(1).max(3000),
  chatType: z.nativeEnum(ChatType),
  chatId: z.string(),
})

export const sendMessageBodySchemaBodyValidationPipe = new ZodValidationPipe(
  sendMessageBodySchema,
)

export type SendMessageBodySchema = z.infer<typeof sendMessageBodySchema>
