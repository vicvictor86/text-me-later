import { z } from 'zod'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'

const createPrivateChatBodySchema = z.object({
  otherUserId: z.string(),
  text: z.string().min(1).max(3000),
})

export const createPrivateChatBodySchemaBodyValidationPipe =
  new ZodValidationPipe(createPrivateChatBodySchema)

export type CreatePrivateChatBodySchema = z.infer<
  typeof createPrivateChatBodySchema
>
