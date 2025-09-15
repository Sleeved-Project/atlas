import vine from '@vinejs/vine'

export const scanValidator = vine.compile(
  vine.object({
    file: vine.file({
      size: '5mb',
      extnames: ['png', 'jpg', 'jpeg'],
    }),
    threshold: vine.number().min(0).max(1).optional(),
  })
)
