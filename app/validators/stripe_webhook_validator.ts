import vine from '@vinejs/vine'

export const stripeWebhookHeaderSchema = vine.object({
  'stripe-signature': vine.string(),
})

export const stripeWebhookValidator = vine.compile(
  vine.object({
    headers: stripeWebhookHeaderSchema,
    raw: vine.string(),
  })
)
