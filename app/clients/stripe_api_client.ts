import { StripeException } from '#exceptions/payment_exception'
import env from '#start/env'
import Stripe from 'stripe'

export default class StripeApiClient {
  private readonly publishableKey = env.get('STRIPE_PUBLISHABLE_KEY')

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
      throw new StripeException(error)
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

  public async createPaymentSheet(adAmount: number): Promise<{
    paymentIntentClientSecret: string | null
    paymentIntentId: string
    ephemeralKey: string | undefined
    customer: string
  }> {
    try {
      // Create a new customer in Stripe (we will save the customer ID in our DB later)
      const newCustomer = await this.stripe.customers.create()

      // Create an ephemeral key for the customer (used by the Stripe SDK on the client side)
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: newCustomer.id },
        { apiVersion: '2024-06-20' }
      )

      // Create a payment intent for the customer
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: adAmount,
        currency: 'eur',
        customer: newCustomer.id,
        automatic_payment_methods: {
          enabled: true,
        },
      })

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
      const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.publishableKey)

      return event
    } catch (err) {
      throw new StripeException()
    }
  }
}
