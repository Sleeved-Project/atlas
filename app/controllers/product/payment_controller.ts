import NotFoundException from '#exceptions/not_found_exception'
import PaymentService from '#services/payment_service'
import UserService from '#services/me_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import { paymentSchemaValidator } from '#validators/payment_validator'
import AdService from '#services/ad_service'
import PaymentIntentService from '#services/payment_intent_service'
import { PaymentIntentStatus } from '#types/payment_intent_type'
import WebhookProcessor from '#processors/webhook_processor'
import { stripeWebhookValidator } from '#validators/stripe_webhook_validator'
import env from '#start/env'
import PriceUtils from '#utils/price_utils'
import ValidationException from '#exceptions/validation_exception'
import PaymentIntentDuplicateException from '#exceptions/payment_intent_duplicate_exception'
import CostUtils from '#utils/cost_utils'
import NotAllowedToPerformException from '#exceptions/not_allowed_to_buy_exception'

@inject()
export default class PaymentController {
  private readonly publishableKey = env.get('STRIPE_PUBLISHABLE_KEY')
  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
    private adService: AdService,
    private paymentIntentService: PaymentIntentService,
    private webhookProcessor: WebhookProcessor
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
      // Fetch the ad to get the amount and seller info
      const existingPaymentIntent = await this.paymentIntentService.getPaymentIntentByAdId(
        params.id
      )
      if (existingPaymentIntent) {
        throw new PaymentIntentDuplicateException(params.id)
      }

      const ad = await this.adService.getStripePaymentRelevantColumnsAdById(params.id)

      if (ad.sellerId === authUser.id) {
        throw new NotAllowedToPerformException()
      }

      // get customer id, could be a string or null
      const authUserCustomerId = await this.userService.getCustomerIdByUserId(authUser.id)

      const { paymentIntentClientSecret, paymentIntentId, ephemeralKey, customer } =
        await this.paymentService.createPaymentSheet(
          PriceUtils.getPriceInCents(CostUtils.calculateTotalCosts(ad.originalPrice)),
          authUserCustomerId
        )

      // create customer id in db if not existing
      if (!authUserCustomerId) {
        await this.userService.updateUser(authUser.id, { customerId: customer })
      }

      // Update existing ad with new status
      const updatedAd = await this.adService.updateAd(params.id, { statusId: 2 })

      // Save the payment intent id in DB
      await this.paymentIntentService.createPaymentIntent({
        id: paymentIntentId,
        fromId: authUser.id,
        toId: updatedAd.sellerId,
        adId: params.id,
        status: PaymentIntentStatus.CREATED,
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

  async cancelPaymentSheet({ request, authUser, response }: HttpContext) {
    try {
      const payload = await paymentSchemaValidator.validate(request.body())

      // Get the payment intent associated with the ad id
      await this.paymentIntentService.cancelPaymentIntent(payload.id, authUser.id)

      // Update the ad status to "available"
      await this.adService.updateAd(payload.id, { statusId: 1 })

      response.json({
        hasBeenCanceled: true,
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
        publishableKey: this.publishableKey,
      })
    } catch (error) {
      throw error
    }
  }

  async stripeWebhook({ request, response }: HttpContext) {
    try {
      const { headers, raw } = await stripeWebhookValidator.validate({
        headers: request.headers(),
        raw: request.raw(),
      })

      const stripeEvent = await this.paymentService.stripeWebhook(raw, headers['stripe-signature'])

      await this.webhookProcessor.processStripeWebhookEvent(stripeEvent)

      response.status(200).send('Webhook received')
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
