import { StripeException } from '#exceptions/payment_exception'
import env from '#start/env'
import Stripe from 'stripe'

export default class StripeApiClient {
  private readonly stripe = new Stripe(env.get('STRIPE_SECRET_KEY'), {
    apiVersion: '2025-07-30.basil',
  })
  constructor() {}

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
}
