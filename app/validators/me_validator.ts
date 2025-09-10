import vine from '@vinejs/vine'

export const updateUserValidator = vine.compile(
  vine.object({
    firstname: vine.string().trim().maxLength(50).minLength(2).nullable(),
    lastname: vine.string().trim().maxLength(50).minLength(2).nullable(),
    phone: vine
      .string()
      .trim()
      .regex(/^\+(?:[0-9] ?){6,14}[0-9]$/) // Format E.164 strict
      .nullable(),
    description: vine.string().trim().maxLength(500).nullable(),
    profilePictureUrl: vine.string().trim().maxLength(2000).url().nullable(),
  })
)
