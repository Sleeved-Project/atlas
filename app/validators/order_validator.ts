import vine from '@vinejs/vine'
import { paginationSchema } from './common_validator.js'

export const getOrdersFiltersValidator = vine.compile(
  vine.object({
    ...paginationSchema.getProperties(),
  })
)
