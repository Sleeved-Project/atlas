import vine from '@vinejs/vine'
import { baseParamsSchema, paginationSchema } from './common_validator.js'

export const setsFiltersSchema = vine.object({
  name: vine.string().optional(),
})

export const getAllSetsFiltersValidator = vine.compile(
  vine.object({
    ...paginationSchema.getProperties(),
    ...setsFiltersSchema.getProperties(),
  })
)

export const getSetDetailParamsValidator = vine.compile(
  vine.object({
    ...baseParamsSchema.getProperties(),
  })
)

export const getSetCardsValidator = vine.compile(
  vine.object({
    params: vine.object({
      ...baseParamsSchema.getProperties(),
    }),
    filters: vine.object({
      ...paginationSchema.getProperties(),
      ...setsFiltersSchema.getProperties(),
    }),
  })
)
