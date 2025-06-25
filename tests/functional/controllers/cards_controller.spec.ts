import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import { CardFactory } from '#database/factories/card'
import AuthServiceMock from '#tests/mocks/auth_service_mock'

test.group('Card controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(async () => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(async () => {
    testUtils.db().withGlobalTransaction()
  })

  group.teardown(async () => {
    wardenApiClientStub.restore()
  })

  test('index - it should return paginated cards', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.properties(body, ['meta', 'data'])

    assert.properties(body.meta, [
      'total',
      'perPage',
      'currentPage',
      'lastPage',
      'firstPage',
      'firstPageUrl',
      'lastPageUrl',
      'nextPageUrl',
      'previousPageUrl',
    ])

    assert.equal(body.data.length, 10)

    const firstCard = body.data[0]
    assert.properties(firstCard, ['id', 'imageSmall'])
  })

  test('index - it should apply pagination correctly', async ({ client, assert }) => {
    const response1 = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 5 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response1.assertStatus(200)
    const page1Data = response1.body().data

    const response2 = await client
      .get('/api/v1/cards')
      .qs({ page: 2, limit: 5 })
      .header('Authorization', 'Bearer fake-token-for-testing')
    response2.assertStatus(200)
    const page2Data = response2.body().data

    assert.notEqual(page1Data[0].id, page2Data[0].id)

    assert.equal(page1Data.length, 5)
    assert.equal(page2Data.length, 5)
  })

  test('index - it should handle invalid pagination parameters', async ({ client }) => {
    const responseNegativePage = await client
      .get('/api/v1/cards')
      .qs({ page: -1, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNegativePage.assertStatus(422)

    const responseNegativeLimit = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: -5 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNegativeLimit.assertStatus(422)

    const responseInvalidParams = await client
      .get('/api/v1/cards')
      .qs({ page: 'abc', limit: 'xyz' })
      .header('Authorization', 'Bearer fake-token-for-testing')
    responseInvalidParams.assertStatus(422)
  })

  test('index - it should handle invalid filters params', async ({ client, assert }) => {
    const responseNotExistingFilter = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10, names: 'Pikachu' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNotExistingFilter.assertStatus(200)
    assert.isAtLeast(responseNotExistingFilter.body().data.length, 1)

    const responseEmptyFilter = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10, name: '' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseEmptyFilter.assertStatus(200)
    assert.equal(responseEmptyFilter.body().data.length, 10)

    const responseNotExistingName = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10, name: '123QS' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNotExistingName.assertStatus(200)
    assert.isEmpty(responseNotExistingName.body().data)
  })

  test('index - it should return 200 and empty page for non-existent page', async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/api/v1/cards')
      .qs({ page: 99999, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.isEmpty(response.body().data)
  })

  test('show - it should return a single base card infos by id', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/cards/base1-23')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const card = response.body()

    assert.equal(card.id, 'base1-23')
    assert.properties(card, ['id', 'imageLarge', 'number', 'set'])
    assert.properties(card.set, ['id', 'name', 'imageSymbol'])
  })

  test('show - it should return 404 for non-existent card', async ({ client }) => {
    const response = await client
      .get('/api/v1/cards/non-existent-id')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)

    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('details - it should return a single card details by id', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/cards/base1-23/details')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const card = response.body()

    assert.equal(card.id, 'base1-23')
    assert.properties(card, ['id', 'flavorText', 'set', 'rarity', 'artist', 'subtypes'])
    assert.properties(card.set, ['id', 'releaseDate'])
    assert.properties(card.rarity, ['id', 'label'])
    assert.properties(card.artist, ['id', 'name'])
    assert.isArray(card.subtypes)
    assert.properties(card.subtypes[0], ['id', 'label'])
  })

  test('details - it should return 404 for non-existent card', async ({ client }) => {
    const response = await client
      .get('/api/v1/cards/non-existent-/details')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)

    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('prices - it should return card prices with correct market data structure', async ({
    client,
    assert,
  }) => {
    await CardFactory.merge({ id: 'base1-0' })
      .with('cardMarketPrices', 1, (cardMarketPrices) =>
        cardMarketPrices.merge({
          id: 1234567890,
          url: 'https://cardmarket.com/base1-0',
          trendPrice: 10.5,
          reverseHoloTrend: 15.75,
          cardId: 'base1-0',
        })
      )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({
            id: 1234567890,
            url: 'https://tcgplayer.com/base1-0',
            cardId: 'base1-0',
          })
          .with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge([
              { id: 1234567890, type: 'normal', market: 10.5 },
              { id: 1234567891, type: 'holofoil', market: 15.75 },
            ])
          )
      )
      .create()

    const response = await client
      .get('/api/v1/cards/base1-0/prices')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const cardPrices = response.body()

    assert.equal(cardPrices.id, 'base1-0')

    assert.properties(cardPrices, ['cardMarketReporting'])
    assert.properties(cardPrices.cardMarketReporting, ['id', 'url', 'cardMarketPrices'])
    assert.isArray(cardPrices.cardMarketReporting.cardMarketPrices)
    assert.isNotEmpty(cardPrices.cardMarketReporting.cardMarketPrices)
    const cardMarketfirstPrice = cardPrices.cardMarketReporting.cardMarketPrices[0]
    assert.properties(cardMarketfirstPrice, ['id', 'type', 'market'])

    assert.properties(cardPrices, ['tcgPlayerReporting'])
    assert.properties(cardPrices.tcgPlayerReporting, ['id', 'url', 'tcgPlayerPrices'])
    assert.isArray(cardPrices.tcgPlayerReporting.tcgPlayerPrices)
    assert.isNotEmpty(cardPrices.tcgPlayerReporting.tcgPlayerPrices)
    const tcgPlayerFirstPrice = cardPrices.tcgPlayerReporting.tcgPlayerPrices[0]
    assert.properties(tcgPlayerFirstPrice, ['id', 'type', 'market'])
  })

  test('prices - it should return 404 for non-existent card', async ({ client }) => {
    const response = await client
      .get('/api/v1/cards/non-existent-id/prices')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)

    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('rarity - it should return all rarities', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/cards/rarity')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const rarities = response.body()
    assert.isArray(rarities)
    assert.isAbove(rarities.length, 0, 'Expected at least one rarity to be returned')
    assert.properties(rarities[0], ['id', 'label'])
  })

  test('subtype - it should return all subtypes', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/cards/subtype')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const subtypes = response.body()
    assert.isArray(subtypes)
    assert.isAtLeast(subtypes.length, 0, 'Expected at least one subtype to be returned')
    assert.properties(subtypes[0], ['id', 'label'])
  })

  test('artist - it should return all artists', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/cards/artist')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const artists = response.body()
    assert.isArray(artists)
    assert.isAtLeast(artists.length, 0, 'Expected at least one artist to be returned')
    assert.properties(artists[0], ['id', 'name'])
  })
})
