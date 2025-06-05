import vine from '@vinejs/vine'

/**
 * Validates the cards fetch action
 */
export const getAllCardsValidator = vine.compile(
  vine.object({
    queries: vine.object({
      page: vine.number().positive(),
      limit: vine.number().positive().max(30),
    }),
  })
)
