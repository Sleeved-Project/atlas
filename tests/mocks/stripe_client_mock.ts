import sinon from 'sinon'
import StripeApiClient from '#clients/stripe_api_client'

export const STRIPE_ACCOUNT_ID = 'acct_12345'
export const STRIPE_ACCOUNT_LINK_URL = 'https://stripe.com/linking-url'

export default class StripeClientMock {
  static createStripeAccount(): sinon.SinonStub {
    const stripeCreateAccountStub = sinon
      .stub(StripeApiClient.prototype, 'createStripeAccount')
      .resolves(STRIPE_ACCOUNT_ID)
    return stripeCreateAccountStub
  }

  static linkStripeAccount(): sinon.SinonStub {
    const stripeLinkAccountStub = sinon
      .stub(StripeApiClient.prototype, 'linkStripeAccount')
      .resolves(STRIPE_ACCOUNT_LINK_URL)
    return stripeLinkAccountStub
  }

  static deleteStripeAccount(): sinon.SinonStub {
    const stripeDeleteAccountStub = sinon
      .stub(StripeApiClient.prototype, 'deleteStripeAccount')
      .resolves(STRIPE_ACCOUNT_ID)
    return stripeDeleteAccountStub
  }

  static createPaymentSheet(): sinon.SinonStub {
    const stripeCreatePaymentSheetStub = sinon
      .stub(StripeApiClient.prototype, 'createPaymentSheet')
      .resolves({
        paymentIntentClientSecret: 'psec_12345',
        paymentIntentId: 'pi_12345',
        ephemeralKey: 'ek_12345',
        customer: 'cus_12345',
      })
    return stripeCreatePaymentSheetStub
  }

  static stripeWebhook(type: string): sinon.SinonStub {
    const stripeWebhookStub = sinon.stub(StripeApiClient.prototype, 'stripeWebhook').resolves({
      id: 'evt_1N2bCd2eZvKYlo2C0qHh3eF6',
      object: 'event',
      api_version: '2024-06-20',
      created: 1697052800,
      data: {
        object: {
          id: 'pi_12345',
          object: 'payment_intent',
          amount: 5000,
          currency: 'eur',
          customer: 'cus_12345',
          description: 'Payment for ad ad_12345',
          metadata: {
            adId: 'ad_12345',
            fromId: 'user_12345',
            toId: 'user_67890',
          },
          status: 'succeeded',
        },
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: 'req_12345',
        idempotency_key: null,
      },
      type: 'payment_intent.' + type,
    })
    return stripeWebhookStub
  }
}
