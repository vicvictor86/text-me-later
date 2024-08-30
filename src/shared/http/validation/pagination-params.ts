import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

export interface PageQueryParamDTO {
  page?: number
}

export interface perPageQueryParamDTO {
  perPage?: number
}

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('0')
  .transform(Number)
  .pipe(z.number().min(0))

const perPageQueryParamSchema = z
  .string()
  .optional()
  .default('10')
  .transform(Number)
  .pipe(z.number().min(1).max(50))

export const searchQueryParamSchema = z.string().optional()

export const pageQueryValidationPipe = new ZodValidationPipe(
  pageQueryParamSchema,
)

export const perPageQueryValidationPipe = new ZodValidationPipe(
  perPageQueryParamSchema,
)

export const searchQueryValidationPipe = new ZodValidationPipe(
  searchQueryParamSchema,
)
