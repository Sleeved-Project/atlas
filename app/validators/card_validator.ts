import vine from '@vinejs/vine'
import { baseParamsSchema, paginationSchema } from './common_validator.js'

export const cardsFiltersSchema = vine.object({
  name: vine.string().optional(),
  rarities: vine.array(vine.string()).optional(),
  artists: vine.array(vine.string()).optional(),
  subtypes: vine.array(vine.string()).optional(),
  types: vine.array(vine.string()).optional(),
})

export const getAllCardsFiltersValidator = vine.compile(
  vine.object({
    ...paginationSchema.getProperties(),
    ...cardsFiltersSchema.getProperties(),
  })
)

export const getAllMainFolioCardsFiltersValidator = vine.compile(
  vine.object({
    ...paginationSchema.getProperties(),
    ...cardsFiltersSchema.getProperties(),
  })
)

export const getCardDetailParamsValidator = vine.compile(baseParamsSchema)

export const getCardBaseParamsValidator = vine.compile(baseParamsSchema)

export const getCardPriceParamsValidator = vine.compile(baseParamsSchema)
