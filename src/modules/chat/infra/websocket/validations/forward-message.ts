import { z } from 'zod'
import { ChatType } from '../../mongoose/schemas/chat-message'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'

const forwardMessageBodySchema = z.object({
  chatType: z.nativeEnum(ChatType),
  messageId: z.string(),
  chatId: z.string(),
})

export const forwardMessageBodySchemaBodyValidationPipe = new ZodValidationPipe(
  forwardMessageBodySchema,
)

export type ForwardMessageBodySchema = z.infer<typeof forwardMessageBodySchema>
