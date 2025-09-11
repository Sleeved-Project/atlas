import { StripeException } from '#exceptions/payment_exception'
import env from '#start/env'
import Stripe from 'stripe'

export default class StripeApiClient {
  private readonly stripe = new Stripe(env.get('STRIPE_SECRET_KEY'), {
    apiVersion: '2025-07-30.basil',
  })
  constructor() {}

  get webhooks() {
    return this.stripe.webhooks
  }

  public async createStripeAccount(): Promise<string> {
    try {
      const account = await this.stripe.accounts.create({
        controller: {
          stripe_dashboard: {
            type: 'express',
          },
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
        },
        business_type: 'individual',
        // We are setting the business profile to comply with Stripe's requirements
        business_profile: {
          mcc: '5945',
          product_description: 'Selling trading cards via Folio',
          url: 'https://sleeved.fr',
        },
      })
      return account.id
    } catch (error) {
      throw new StripeException()
    }
  }

  public async linkStripeAccount(
    accountId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<any> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        return_url: returnUrl,
        refresh_url: refreshUrl,
        type: 'account_onboarding',
      })
      return accountLink
    } catch (error) {
      throw new StripeException()
    }
  }

  public async deleteStripeAccount(accountId: string): Promise<string> {
    try {
      const deletedAccount = await this.stripe.accounts.del(accountId)
      return deletedAccount.id
    } catch (error) {
      throw new StripeException()
    }
  }

  public async createPaymentSheet(userId: string): Promise<{
    paymentIntentClientSecret: string | null
    paymentIntentId: string
    ephemeralKey: string | undefined
    customer: string
  }> {
    console.log(`Creating payment sheet for user ${userId}`)

    try {
      // Create a new customer in Stripe
      const newCustomer = await this.stripe.customers.create()

      // Create an ephemeral key for the customer
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: newCustomer.id },
        { apiVersion: '2024-06-20' }
      )

      // Create a payment intent for the customer
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 2990, // Test amount in cents
        currency: 'eur',
        customer: newCustomer.id,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      // TODO: store paymentintent.id, from and to ids and ad id to payment intent table

      return {
        paymentIntentClientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        ephemeralKey: ephemeralKey.secret,
        customer: newCustomer.id,
      }
    } catch (error) {
      throw new StripeException()
    }
  }

  public async stripeWebhook(
    rawBody: string,
    signature: string | string[]
  ): Promise<Record<string, any>> {
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new StripeException()
      }
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )

      return event
    } catch (err) {
      throw new StripeException()
    }
  }
}
