import vine from '@vinejs/vine'

export const paginationSchema = vine.object({
  page: vine.number().positive(),
  limit: vine.number().positive().max(300),
})

export const baseParamsSchema = vine.object({
  id: vine.string(),
})
