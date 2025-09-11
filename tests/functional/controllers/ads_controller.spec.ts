import { AdFactory } from '#database/factories/ad'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { CardFactory } from '#database/factories/card'
import { CardFinishBasicFactory, CardFinishFactory } from '#database/factories/card_finish'
import { AdStatusFactory } from '#database/factories/ad_status'
import { CardConditionBasicFactory, CardConditionFactory } from '#database/factories/card_condition'
import AuthServiceMock from '#tests/mocks/auth_service_mock'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

test.group('Ads controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('index - should return paginated ads', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()
    const cardFinish = await CardFinishFactory.merge({ id: 1, label: 'Holofoil' }).create()
    const adStatus = await AdStatusFactory.merge({ id: 1, label: 'Published' }).create()
    const cardCondition = await CardConditionFactory.merge({ id: 1 }).create()

    await AdFactory.merge({
      finishId: cardFinish.id,
      statusId: adStatus.id,
      conditionId: cardCondition.id,
    })
      .with('card')
      // .with('condition')
      // .with('finish')
      // .with('status')
      .with('seller')
      .createMany(15)

    const response = await client
      .get('/api/v1/ads')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.properties(response.body(), ['data', 'meta'])
    assert.isArray(response.body().data)
    assert.equal(response.body().data.length, 15)
    assert.properties(response.body().meta, ['total', 'perPage', 'currentPage'])
  })

  test('index - should handle pagination parameters', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.merge({ id: 'base1-1' }).create()
    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()
    const status = await AdStatusFactory.merge({ id: 1, label: 'Published' }).create()

    await AdFactory.merge({
      cardId: card.id,
      conditionId: condition.id,
      finishId: finish.id,
      statusId: status.id,
    })
      .with('card')
      // .with('condition')
      // .with('finish')
      // .with('status')
      .with('seller')
      .createMany(25)

    const response = await client
      .get('/api/v1/ads')
      .qs({ page: 2, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    console.log('response:', response.body()['data'][0])
    assert.equal(response.body().data.length, 10)
    assert.equal(response.body().meta.currentPage, 2)
    assert.equal(response.body().meta.total, 25)
  })

  test('search - should filter ads by card name', async ({ client, assert }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ id: 'base3' }).create()

    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()
    const status = await AdStatusFactory.merge({ id: 3, label: 'Published' }).create()

    const card1 = await CardFactory.merge({
      name: 'Pikachu',
      artistId: artist.id,
      rarityId: rarity.id,
      legalityId: legality.id,
      setId: set.id,
    }).create()

    const card2 = await CardFactory.merge({
      name: 'Charizard',
      artistId: artist.id,
      rarityId: rarity.id,
      legalityId: legality.id,
      setId: set.id,
    }).create()

    await AdFactory.merge({
      cardId: card1.id,
      conditionId: condition.id,
      finishId: finish.id,
      statusId: status.id,
    })
      .with('seller')
      .create()

    await AdFactory.merge({
      cardId: card2.id,
      conditionId: condition.id,
      finishId: finish.id,
      statusId: status.id,
    })
      .with('seller')
      .create()

    const response = await client
      .get('/api/v1/ads/search')
      .qs({ query: 'pika' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().data.length, 1)
    assert.equal(response.body().data[0].card.name, 'Pikachu')
  })

  test('search - should return empty results for non-matching query', async ({
    client,
    assert,
  }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ id: 'base4' }).create()

    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()
    const status = await AdStatusFactory.merge({ id: 4, label: 'Published' }).create()

    await AdFactory.merge({
      conditionId: condition.id,
      finishId: finish.id,
      statusId: status.id,
    })
      .with('card', 1, (card) =>
        card.merge({
          artistId: artist.id,
          rarityId: rarity.id,
          legalityId: legality.id,
          setId: set.id,
        })
      )
      .with('seller')
      .createMany(3)

    const response = await client
      .get('/api/v1/ads/search')
      .qs({ query: 'nonexistent' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().data.length, 0)
  })

  test('search - should require query parameter', async ({ client }) => {
    const response = await client
      .get('/api/v1/ads/search')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(422)
  })
})
