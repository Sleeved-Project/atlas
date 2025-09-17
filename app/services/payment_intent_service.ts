import PaymentIntent from '#models/payment_intent'
import { PaymentIntentStatus } from '#types/payment_intent_status'

interface CreatePaymentIntentParams {
  id: string
  fromId: string
  toId: string
  adId: string
  status: string
}

export default class PaymentIntentService {
  async createPaymentIntent({
    id,
    fromId,
    toId,
    adId,
    status,
  }: CreatePaymentIntentParams): Promise<PaymentIntent> {
    return await PaymentIntent.create({
      id,
      fromId,
      toId,
      adId,
      status,
    })
  }

  async updatePaymentIntent(id: string, data: Partial<PaymentIntent>) {
    const paymentIntent = await PaymentIntent.findOrFail(id)
    paymentIntent.merge(data)
    await paymentIntent.save()

    return paymentIntent
  }

  async getPaymentIntentByAdId(adId: string): Promise<PaymentIntent | null> {
    return await PaymentIntent.query()
      .where('ad_id', adId)
      .whereIn('status', [
        PaymentIntentStatus.CREATED,
        PaymentIntentStatus.PROCESSING,
        PaymentIntentStatus.SUCCEEDED,
      ])
      .first()
  }

  async getCurrentPaymentIntentStatus(id: string): Promise<PaymentIntent> {
    return await PaymentIntent.query().select('status').where('id', id).firstOrFail()
  }

  async cancelPaymentIntent(adId: string, userId: string): Promise<PaymentIntent> {
    const paymentIntent = await PaymentIntent.query()
      .where('ad_id', adId)
      .where('fromId', userId)
      .whereIn('status', [PaymentIntentStatus.CREATED, PaymentIntentStatus.PROCESSING])
      .firstOrFail()
    paymentIntent.status = PaymentIntentStatus.CANCELED
    await paymentIntent.save()
    return paymentIntent
  }
}
