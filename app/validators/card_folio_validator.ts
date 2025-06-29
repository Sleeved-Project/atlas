import vine from '@vinejs/vine'

/**
 * Validates the folio collect action
 */
export const collectValidator = vine.compile(
  vine.object({
    cardId: vine.string(),
  })
)

export const occurenceValidator = vine.compile(
  vine.object({
    cardId: vine.string(),
    occurrence: vine.number().min(1).max(1000),
  })
)

export const removeMainValidator = vine.compile(
  vine.object({
    cardId: vine.string(),
  })
)
