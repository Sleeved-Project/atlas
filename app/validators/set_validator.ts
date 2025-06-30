import vine from '@vinejs/vine'

/**
 * Validates the cards fetch action
 */
export const getAllSetsFiltersValidator = vine.compile(
  vine.object({
    page: vine.number().positive(),
    limit: vine.number().positive().max(300),
    name: vine.string().optional(),
  })
)

export const getSetDetailParamsValidator = vine.compile(
  vine.object({
    id: vine.string(),
  })
)

export const getSetCardsParamsValidator = vine.compile(
  vine.object({
    id: vine.string(),
  })
)
