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
