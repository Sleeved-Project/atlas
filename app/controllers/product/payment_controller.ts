import NotFoundException from '#exceptions/not_found_exception'
import PaymentService from '#services/payment_service'
import UserService from '#services/me_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { StripeException } from '#exceptions/payment_exception'

@inject()
export default class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private userService: UserService
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

  async createPaymentSheet({ authUser, response }: HttpContext) {
    try {
      // TODO This should have an AD id to get the correct price

      const { paymentIntent, ephemeralKey, customer } =
        await this.paymentService.createPaymentSheet(authUser.id)

      response.json({
        paymentIntent,
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
    // TODO Handle webhook events from Stripe
    try {
      let event = request.body()
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        const signature = request.headers()['stripe-signature']
        console.log(signature)

        const rawBody = request.raw()
        if (!signature || !rawBody) {
          throw new StripeException()
        }
        await this.paymentService.stripeWebhook(event, rawBody, signature)
      }
      response.status(200).send('Webhook received')
    } catch (error) {
      throw error
    }
  }
}
