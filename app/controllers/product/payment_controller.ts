import NotFoundException from '#exceptions/not_found_exception'
import PaymentService from '#services/payment_service'
import UserService from '#services/me_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { StripeException } from '#exceptions/payment_exception'
import { paymentSchemaValidator } from '#validators/payment_validator'
import AdService from '#services/ad_service'
import PaymentIntentService from '#services/payment_intent_service'

@inject()
export default class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
    private adService: AdService,
    private paymentIntentService: PaymentIntentService
  ) {}

  async createAccount({ authUser, response }: HttpContext) {
    try {
      const { linkingUrl, accountId } = await this.paymentService.createAccount()
      await this.userService.updateUser(authUser.id, { stripeId: accountId })

      response.json({
        linkingUrl,
      })
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async stripeAccountLinkSuccess({ response }: HttpContext) {
    response.redirect('folio://sell-form')
  }

  async stripeAccountLinkRefresh({ response }: HttpContext) {
    response.redirect('folio://')
  }

  async createPaymentSheet({ request, authUser, response }: HttpContext) {
    try {
      const params = await paymentSchemaValidator.validate(request.params())
      const { paymentIntentClientSecret, paymentIntentId, ephemeralKey, customer } =
        await this.paymentService.createPaymentSheet(authUser.id)

      // Update existing ad with new status
      const updatedAd = await this.adService.updateAd(params.id, { statusId: 2 })

      // Save the payment intent id in DB
      await this.paymentIntentService.createPaymentIntent({
        id: paymentIntentId,
        fromId: authUser.id,
        toId: updatedAd.sellerId,
        adId: params.id,
        status: 'created',
      })

      response.json({
        paymentIntent: paymentIntentClientSecret,
        ephemeralKey,
        customer,
      })
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async getPublishableKey({ response }: HttpContext) {
    try {
      response.json({
        publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
      })
    } catch (error) {
      throw error
    }
  }

  async stripeWebhook({ request, response }: HttpContext) {
    try {
      const signature = request.headers()['stripe-signature']
      const rawBody = request.raw()
      if (!signature || !rawBody) {
        throw new StripeException()
      }

      const stripeEvent = await this.paymentService.stripeWebhook(rawBody, signature)
      // TODO return the event to the caller instead of handling it here

      switch (stripeEvent.type) {
        case 'payment_intent.succeeded':
          console.log('PaymentIntent was successful!')
          break

        case 'payment_intent.payment_failed':
          console.log('PaymentIntent failed.')
          break

        case 'payment_intent.canceled':
          console.log('PaymentIntent was canceled.')
          break

        default:
          break
      }

      response.status(200).send('Webhook received')
    } catch (error) {
      throw error
    }
  }
}
