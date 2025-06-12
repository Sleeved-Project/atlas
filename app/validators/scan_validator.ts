import vine from '@vinejs/vine'

export const scanAnalyzeValidator = vine.compile(
  vine.object({
    file: vine.file({
      size: '5mb',
      extnames: ['png', 'jpg', 'jpeg'],
    }),
  })
)
