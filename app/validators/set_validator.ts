import vine from '@vinejs/vine'
import { baseParamsSchema, paginationSchema } from './common_validator.js'

export const setsFiltersSchema = vine.object({
  name: vine.string().optional(),
  artists: vine.array(vine.string()).optional(),
  rarities: vine.array(vine.string()).optional(),
  subtypes: vine.array(vine.string()).optional(),
  types: vine.array(vine.string()).optional(),
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
