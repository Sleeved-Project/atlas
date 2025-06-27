import vine from '@vinejs/vine'

/**
 * Validates the folio collect action
 */
export const collectValidator = vine.compile(
  vine.object({
    cardId: vine.string(),
  })
)
