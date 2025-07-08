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

export const childFolioCardsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string(),
    }),
    filters: vine.object({
      page: vine.number().positive(),
      limit: vine.number().positive().max(300),
    }),
  })
)
