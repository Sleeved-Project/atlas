import vine from '@vinejs/vine'

/**
 * Validates the card folio collect action
 */
export const collectValidator = vine.compile(
  vine.object({
    cardId: vine.string(),
  })
)
