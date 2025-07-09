import vine from '@vinejs/vine'

/**
 * Validates the folio collect action
 */
export const showChildFolioValidator = vine.compile(
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

export const createChildFolioValidator = vine.compile(
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
