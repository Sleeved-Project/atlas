import vine from '@vinejs/vine'
import { paginationSchema } from './common_validator.js'

export const artistFiltersSchema = vine.object({
  name: vine.string().optional(),
})

export const getAllFiltersValidator = vine.compile(
  vine.object({
    artists: vine.object({
      ...paginationSchema.getProperties(),
      ...artistFiltersSchema.getProperties(),
    }),
  })
)
