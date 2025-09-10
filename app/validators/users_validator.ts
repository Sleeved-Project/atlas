import vine from '@vinejs/vine'

export const searchUsersValidator = vine.compile(
  vine.object({
    username: vine.string().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const getUserParamsValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
  })
)
