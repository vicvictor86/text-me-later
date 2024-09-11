import { z } from 'zod'
import { ChatType } from '../../mongoose/schemas/chat-message'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'

const answerMessageBodySchema = z.object({
  chatType: z.nativeEnum(ChatType),
  messageId: z.string(),
  text: z.string(),
})

export const answerMessageBodySchemaBodyValidationPipe = new ZodValidationPipe(
  answerMessageBodySchema,
)

export type AnswerMessageBodySchema = z.infer<typeof answerMessageBodySchema>
