import vine from '@vinejs/vine'

/**
 * Validates the folio collect action
 */
export const collectValidator = vine.compile(
  vine.object({
    cardId: vine.string(),
  })
)

export const occurrenceValidator = vine.compile(
  vine.object({
    occurrence: vine.number().min(1).max(1000),
    params: vine.object({
      id: vine.string(),
    }),
  })
)

export const removeMainValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string(),
    }),
  })
)

export const createFolioValidator = vine.compile(
  vine.object({
    imageUrl: vine.string(),
    name: vine.string().minLength(1).maxLength(100),
    cards: vine.array(
      vine.object({
        id: vine.string(),
        occurrence: vine.number().min(1).max(1000),
      })
    ),
  })
)
