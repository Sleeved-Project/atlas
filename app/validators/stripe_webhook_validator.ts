import vine from '@vinejs/vine'

export const stripeWebhookHeaderSchema = vine.object({
  'stripe-signature': vine.string(),
})

export const stripeWebhookHeaderValidator = vine.compile(stripeWebhookHeaderSchema)
