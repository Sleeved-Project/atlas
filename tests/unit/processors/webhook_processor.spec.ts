import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import WebhookProcessor from '#processors/webhook_processor'
import AdService from '#services/ad_service'
import PaymentIntentService from '#services/payment_intent_service'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { CardFactory } from '#database/factories/card'
import { AdStatusFactory } from '#database/factories/ad_status'
import { CardConditionFactory } from '#database/factories/card_condition'
import { CardFinishFactory } from '#database/factories/card_finish'
import { UserFactory } from '#database/factories/user'
import { AdFactory } from '#database/factories/ad'
import { PaymentIntentFactory } from '#database/factories/payment_intent'
import PaymentIntent from '#models/payment_intent'
import Ad from '#models/ad'
import OrderProcessor from '#processors/order_processor'
import UserAddressService from '#services/user_address_service'
import OrderService from '#services/order_service'

test.group('WebhookProcessor', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let webhookProcessor: WebhookProcessor
  let adService: AdService
  let paymentIntentService: PaymentIntentService
  let orderProcessor: OrderProcessor
  let userAddressService: UserAddressService
  let orderService: OrderService

  group.setup(() => {
    adService = new AdService()
    paymentIntentService = new PaymentIntentService()
    userAddressService = new UserAddressService()
    orderService = new OrderService()

    orderProcessor = new OrderProcessor(
      adService,
      paymentIntentService,
      userAddressService,
      orderService
    )

    webhookProcessor = new WebhookProcessor(paymentIntentService, adService, orderProcessor)
  })

  test('should update payment intent on succeeded event', async ({ assert }) => {
    await ArtistFactory.merge({ id: 1 }).create()
    await RarityFactory.merge({ id: 1 }).create()
    await LegalityFactory.merge({ id: 1 }).create()
    await SetFactory.merge({ id: 'base1' }).create()
    await CardFactory.merge({
      id: 'card_12345',
      setId: 'base1',
      artistId: 1,
      rarityId: 1,
      legalityId: 1,
    }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    await CardConditionFactory.merge({ id: 1 }).create()
    await CardFinishFactory.merge({ id: 1 }).create()
    const user = await UserFactory.merge({ id: 'user_67890', stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      id: 'ad_12345',
      cardId: 'card_12345',
      sellerId: 'user_67890',
    }).create()

    await PaymentIntentFactory.merge({
      id: 'pi_12345',
      fromId: user.id,
      toId: 'user_67890',
      adId: ad.id,
      status: 'created',
    }).create()
    const stripeEvent = {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_12345' } },
    }

    await webhookProcessor.processStripeWebhookEvent(stripeEvent)

    const updatedPaymentIntent = await PaymentIntent.query().where('id', 'pi_12345').first()
    assert.equal(updatedPaymentIntent?.status, 'succeeded')
  })

  test('should update payment intent and ad on failed event or canceled event', async ({
    assert,
  }) => {
    await ArtistFactory.merge({ id: 1 }).create()
    await RarityFactory.merge({ id: 1 }).create()
    await LegalityFactory.merge({ id: 1 }).create()
    await SetFactory.merge({ id: 'base1' }).create()
    await CardFactory.merge({
      id: 'card_12345',
      setId: 'base1',
      artistId: 1,
      rarityId: 1,
      legalityId: 1,
    }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    await CardConditionFactory.merge({ id: 1 }).create()
    await CardFinishFactory.merge({ id: 1 }).create()
    const user = await UserFactory.merge({ id: 'user_67890', stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      id: 'ad_12345',
      cardId: 'card_12345',
      sellerId: 'user_67890',
    }).create()

    await PaymentIntentFactory.merge({
      id: 'pi_12345',
      fromId: user.id,
      toId: 'user_67890',
      adId: ad.id,
      status: 'created',
    }).create()
    const stripeEvent = {
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_12345' } },
    }

    await webhookProcessor.processStripeWebhookEvent(stripeEvent)

    const updatedPaymentIntent = await PaymentIntent.query().where('id', 'pi_12345').first()

    assert.equal(updatedPaymentIntent?.status, 'payment_failed')

    const updatedAd = await Ad.query().where('id', ad.id).first()
    assert.equal(updatedAd?.statusId, 1)
  })

  test('should not call services if new payment intent service equals current status', async ({
    assert,
  }) => {
    await ArtistFactory.merge({ id: 1 }).create()
    await RarityFactory.merge({ id: 1 }).create()
    await LegalityFactory.merge({ id: 1 }).create()
    await SetFactory.merge({ id: 'base1' }).create()
    await CardFactory.merge({
      id: 'card_12345',
      setId: 'base1',
      artistId: 1,
      rarityId: 1,
      legalityId: 1,
    }).create()
    await AdStatusFactory.merge({ id: 2 }).create()
    await CardConditionFactory.merge({ id: 1 }).create()
    await CardFinishFactory.merge({ id: 1 }).create()
    const user = await UserFactory.merge({ id: 'user_67890', stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      id: 'ad_12345',
      cardId: 'card_12345',
      sellerId: 'user_67890',
      statusId: 2,
    }).create()

    const paymentIntent = await PaymentIntentFactory.merge({
      id: 'pi_12345',
      fromId: user.id,
      toId: 'user_67890',
      adId: ad.id,
      status: 'canceled',
    }).create()

    const stripeEvent = {
      type: 'payment_intent.canceled',
      data: { object: { id: paymentIntent.id, status: paymentIntent.status } },
    }

    await webhookProcessor.processStripeWebhookEvent(stripeEvent)

    const unchangedAd = await Ad.query().where('id', ad.id).first()
    assert.equal(unchangedAd?.statusId, 2)
  })
})
