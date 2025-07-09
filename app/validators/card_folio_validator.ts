import vine from '@vinejs/vine'

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
