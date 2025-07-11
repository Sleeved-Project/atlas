import vine from '@vinejs/vine'
import { baseParamsSchema, paginationSchema } from './common_validator.js'

/**
 * Validates the folio collect action
 */
export const showChildFolioValidator = vine.compile(
  vine.object({
    params: vine.object({
      ...baseParamsSchema.getProperties(),
    }),
  })
)

export const childFolioCardsValidator = vine.compile(
  vine.object({
    params: vine.object({
      ...baseParamsSchema.getProperties(),
    }),
    filters: vine.object({
      ...paginationSchema.getProperties(),
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

export const collectValidator = vine.compile(
  vine.object({
    cardId: vine.string(),
  })
)

export const updateOccurrenceValidator = vine.compile(
  vine.object({
    occurrence: vine.number().min(1).max(1000),
    params: vine.object({
      ...baseParamsSchema.getProperties(),
    }),
  })
)

export const removeCardValidator = vine.compile(
  vine.object({
    params: vine.object({
      ...baseParamsSchema.getProperties(),
    }),
  })
)
