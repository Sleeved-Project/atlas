import vine from '@vinejs/vine'

export const createAddressValidator = vine.compile(
  vine.object({
    road: vine.string(),
    additionalInfo: vine.string().optional(),
    zipcode: vine.string(),
    city: vine.string(),
    country: vine.string(),
    countrycode: vine.string(),
  })
)
