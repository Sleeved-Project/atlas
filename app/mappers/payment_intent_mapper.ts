import PaymentIntent from '#models/payment_intent'
import { PaymentIntentBuyerInfosOutputDTO } from '#types/payment_intent_type'

export default class PaymentIntentMapper {
  public static toPaymentIntentBuyerInfosOutputDTO(
    paymentIntent: PaymentIntent
  ): PaymentIntentBuyerInfosOutputDTO {
    return {
      username: paymentIntent.from.username,
      profilePictureUrl: paymentIntent.from.profilePictureUrl,
    }
  }
}
