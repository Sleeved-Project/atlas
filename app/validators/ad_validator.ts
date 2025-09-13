import vine from '@vinejs/vine'

export const adCardSchema = vine.object({
  cardId: vine.string(),
  price: vine.number().positive(),
  conditionId: vine.number().positive(),
  finishId: vine.number().positive(),
  certificateId: vine.string().optional(),
})

export const adFilesSchema = vine.object({
  rectoFile: vine.file({
    size: '5mb',
    extnames: ['png', 'jpg', 'jpeg'],
  }),
  versoFile: vine.file({
    size: '5mb',
    extnames: ['png', 'jpg', 'jpeg'],
  }),
})

export const createAdValidator = vine.compile(
  vine.object({
    ...adCardSchema.getProperties(),
    ...adFilesSchema.getProperties(),
  })
)

export const listAdsValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const searchAdsValidator = vine.compile(
  vine.object({
    query: vine.string().minLength(1).maxLength(100),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)
