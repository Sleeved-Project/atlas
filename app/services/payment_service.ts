import StripeApiClient from '#clients/stripe_api_client'

interface CreateAccountResponse {
  linkingUrl: string
  accountId: string
}

interface CreatePaymentSheetResponse {
  paymentIntent: string | null
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

  async createPaymentSheet(userId: string): Promise<CreatePaymentSheetResponse> {
    const { paymentIntent, ephemeralKey, customer } =
      await this.stripeApiClient.createPaymentSheet(userId)
    return { paymentIntent, ephemeralKey, customer }
  }

  async stripeWebhook(
    event: Record<string, any>,
    rawBody: string,
    signature: string | string[]
  ): Promise<void> {
    await this.stripeApiClient.stripeWebhook(event, rawBody, signature)
  }
}
