import vine from '@vinejs/vine'

export const linkAccountSchema = vine.object({
  accountId: vine.string(),
})

export const linkAccountValidator = vine.compile(linkAccountSchema)
