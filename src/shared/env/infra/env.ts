import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3333),
  MONGO_URI: z.string().url(),
  MONGO_URI_TEST: z.string().url(),
  NODE_ENV: z.string().default('development'),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
})

export type Env = z.infer<typeof envSchema>
