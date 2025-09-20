import StripeApiClient from '#clients/stripe_api_client'
import Stripe from 'stripe'

interface CreateAccountResponse {
  linkingUrl: string
  accountId: string
}

interface CreatePaymentSheetResponse {
  paymentIntentClientSecret: string | null
  paymentIntentId: string
  ephemeralKey: string | undefined
  customer: string
}

export default class PaymentService {
  private stripeApiClient: StripeApiClient
  constructor() {
    this.stripeApiClient = new StripeApiClient()
  }

  async createAccount(): Promise<CreateAccountResponse> {
    const accountId = await this.stripeApiClient.createStripeAccount()
    const accountLink = await this.linkAccount(accountId)
    return { linkingUrl: accountLink, accountId }
  }

  async getStripeAccountTOSAcceptance(
    accountId: string
  ): Promise<Stripe.Account.TosAcceptance | null> {
    return await this.stripeApiClient.retrieveStripeAccount(accountId)
  }

  async finishAccountOnboarding(accountId: string): Promise<string> {
    const accountLink = await this.linkAccount(accountId)
    return accountLink
  }

  protected async linkAccount(accountId: string): Promise<string> {
    // These Urls need to be actual URLs that Stripe can reach otherwise Stripe rejects the account link creation
    const returnUrl = `${process.env.ATLAS_BASE_URL}/payment/account/success`
    const refreshUrl = `${process.env.ATLAS_BASE_URL}/payment/account/refresh`

    const accountLink = await this.stripeApiClient.linkStripeAccount(
      accountId,
      returnUrl,
      refreshUrl
    )

    return accountLink.url
  }

  async createPaymentSheet(
    adAmount: number,
    customerId: string | null
  ): Promise<CreatePaymentSheetResponse> {
    const { paymentIntentClientSecret, paymentIntentId, ephemeralKey, customer } =
      await this.stripeApiClient.createPaymentSheet(adAmount, customerId)
    return { paymentIntentClientSecret, paymentIntentId, ephemeralKey, customer }
  }

  async stripeWebhook(rawBody: string, signature: string | string[]): Promise<Record<string, any>> {
    return await this.stripeApiClient.stripeWebhook(rawBody, signature)
  }
}
