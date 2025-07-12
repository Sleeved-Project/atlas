import vine from '@vinejs/vine'
import { paginationSchema } from './common_validator.js'
import { setsFiltersSchema } from './set_validator.js'

export const getAllArtistFiltersValidator = vine.compile(
  vine.object({
    ...paginationSchema.getProperties(),
    ...setsFiltersSchema.getProperties(),
  })
)
