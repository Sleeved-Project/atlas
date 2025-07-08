import vine from '@vinejs/vine'

/**
 * Validates the folio collect action
 */
export const showValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string(),
    }),
  })
)
