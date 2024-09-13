import { z } from 'zod'
import { ZodValidationPipe } from '@/shared/http/pipes/zod-validation-pipe'

const createGroupChatBodySchema = z.object({
  membersId: z.array(z.string()).min(1).max(120),
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200).optional(),
})

export const createGroupChatBodySchemaBodyValidationPipe =
  new ZodValidationPipe(createGroupChatBodySchema)

export type CreateGroupChatBodySchema = z.infer<
  typeof createGroupChatBodySchema
>
