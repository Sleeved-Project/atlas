import StripeApiClient from '#clients/stripe_api_client'

interface CreateAccountResponse {
  linkingUrl: string
  accountId: string
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
    const returnUrl = `https://192.168.0.33/--/sell/success/`
    const refreshUrl = `https://192.168.0.33/--/sell/refresh/`

    const accountLink = await this.stripeApiClient.linkStripeAccount(
      accountId,
      returnUrl,
      refreshUrl
    )

    return accountLink.url
  }
}
