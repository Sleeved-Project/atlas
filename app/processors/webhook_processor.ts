import AdService from '#services/ad_service'
import PaymentIntentService from '#services/payment_intent_service'
import { inject } from '@adonisjs/core'
import OrderProcessor from './order_processor.js'

@inject()
export default class WebhookProcessor {
  constructor(
    private paymentIntentService: PaymentIntentService,
    private adService: AdService,
    private orderProcessor: OrderProcessor
  ) {}

  public async processStripeWebhookEvent(stripeEvent: Record<string, any>) {
    const paymentIntent = stripeEvent.data.object
    const currentPaymentIntentStatus =
      await this.paymentIntentService.getCurrentPaymentIntentStatus(paymentIntent.id)

    // If the current status equals the new status, do nothing
    if (currentPaymentIntentStatus.status === paymentIntent.status) {
      return
    }

    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        // If succeeded, update the payment intent status in DB
        await this.paymentIntentService.updatePaymentIntent(paymentIntent.id, {
          status: 'succeeded',
        })
        await this.orderProcessor.createOrder(paymentIntent.id)

        break

      case 'payment_intent.payment_failed':
        // If failed, update the payment intent status in DB and the ad status to "available" again
        // In the future, we will notify the user that the payment failed and they need to retry
        const updatedFailedPaymentIntent = await this.paymentIntentService.updatePaymentIntent(
          paymentIntent.id,
          {
            status: 'payment_failed',
          }
        )
        await this.adService.updateAd(updatedFailedPaymentIntent.adId, { statusId: 1 })

        break

      case 'payment_intent.canceled':
        // If canceled, update the payment intent status in DB and the ad status to "available" again
        // In the future, we will notify the buyer that the payment was canceled
        const updatedCanceledPaymentIntent = await this.paymentIntentService.updatePaymentIntent(
          paymentIntent.id,
          {
            status: 'canceled',
          }
        )

        await this.adService.updateAd(updatedCanceledPaymentIntent.adId, { statusId: 1 })

        break

      default:
        break
    }
  }
}
