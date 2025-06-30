import vine from '@vinejs/vine'

/**
 * Validates the cards fetch action
 */
export const getAllCardsFiltersValidator = vine.compile(
  vine.object({
    page: vine.number().positive(),
    limit: vine.number().positive().max(300),
    name: vine.string().optional(),
  })
)

export const getAllMainFolioCardsFiltersValidator = vine.compile(
  vine.object({
    page: vine.number().positive(),
    limit: vine.number().positive().max(300),
    name: vine.string().optional(),
  })
)

export const getCardDetailParamsValidator = vine.compile(
  vine.object({
    id: vine.string(),
  })
)

export const getCardBaseParamsValidator = vine.compile(
  vine.object({
    id: vine.string(),
  })
)

export const getCardPriceParamsValidator = vine.compile(
  vine.object({
    id: vine.string(),
  })
)
