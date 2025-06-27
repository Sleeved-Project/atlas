import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import { FolioFactory } from '#database/factories/folio'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { CardFactory } from '#database/factories/card'
import CardFolio from '#models/card_folio'
import { CardFolioFactory } from '#database/factories/card_folio'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import Card from '#models/card'

test.group('Folio controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('init - it should create a main folio for a user', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/folios/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.properties(response.body(), ['message'])
  })

  test('init - it should not create duplicate main folio', async ({ client, assert }) => {
    await FolioFactory.merge({
      userId: '123',
      isRoot: true,
    }).create()

    const response = await client
      .post('/api/v1/folios/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(409)
    assert.properties(response.body(), ['code', 'message'])
  })

  test('init - it should require authentication', async ({ client }) => {
    const response = await client.post('/api/v1/folios/init')
    response.assertStatus(401)
  })

  test('collect - it should add a card to user main folio', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    const rootFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const card = await CardFactory.create()

    const response = await client
      .post('/api/v1/folios/collect')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ cardId: card.id })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Card added to your main folio successfully',
    })

    const cardFolio = await CardFolio.query()
      .where('folio_id', rootFolio.id)
      .where('card_id', card.id)
      .first()

    assert.exists(cardFolio)
    assert.equal(cardFolio?.folioId, rootFolio.id)
    assert.equal(cardFolio?.cardId, card.id)
    assert.equal(cardFolio?.occurrence, 1)
  })

  test('collect - it should return conflict same card again', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    const rootFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const card = await CardFactory.create()

    await CardFolioFactory.merge({ cardId: card.id, folioId: rootFolio.id, occurrence: 1 }).create()

    const response = await client
      .post('/api/v1/folios/collect')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ cardId: card.id })

    response.assertStatus(409)

    const cardFolio = await CardFolio.query()
      .where('folio_id', rootFolio.id)
      .where('card_id', card.id)
      .first()

    assert.exists(cardFolio)
    assert.equal(cardFolio?.occurrence, 1)
  })

  test('collect - it should return 404 for non-existent card', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .post('/api/v1/folios/collect')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ cardId: 'non-existent-card-id' })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('collect - it should validate the request payload', async ({ client }) => {
    const response = await client
      .post('/api/v1/folios/collect')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({})

    response.assertStatus(422)
  })

  test('collect - it should require authentication', async ({ client }) => {
    const response = await client.post('/api/v1/folios/collect').json({ cardId: 'base1-1' })
    response.assertStatus(401)
  })

  test('cards - should return paginated cards from user main folio', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const cards = await CardFactory.createMany(3)

    await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: mainFolio.id,
      occurrence: 2,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: mainFolio.id,
      occurrence: 1,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: mainFolio.id,
      occurrence: 3,
    }).create()

    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.properties(body, ['meta', 'data'])
    assert.properties(body.meta, ['total', 'currentPage', 'perPage'])
    assert.equal(body.meta.total, 3)
    assert.equal(body.meta.currentPage, 1)

    assert.isArray(body.data)
    assert.equal(body.data.length, 3)

    const firstCard = body.data[0]
    assert.properties(firstCard, ['id', 'imageSmall', 'occurrence'])
    assert.isString(firstCard.id)
    assert.isString(firstCard.imageSmall)
    assert.isNumber(firstCard.occurrence)

    const cardIds = body.data.map((card: Card) => card.id)
    assert.includeMembers(cardIds, [cards[0].id, cards[1].id, cards[2].id])
  })

  test('cards - should return empty result when user has no cards in main folio', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.createMany(3)

    await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 0)
    assert.equal(body.meta.currentPage, 1)
    assert.isArray(body.data)
    assert.equal(body.data.length, 0)
  })

  test('cards - should handle pagination correctly', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const cards = await CardFactory.createMany(15)

    for (const card of cards) {
      await CardFolioFactory.merge({
        cardId: card.id,
        folioId: mainFolio.id,
        occurrence: 1,
      }).create()
    }

    const page1Response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    page1Response.assertStatus(200)
    const page1Body = page1Response.body()
    assert.equal(page1Body.data.length, 10)
    assert.equal(page1Body.meta.currentPage, 1)

    const page2Response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 2, limit: 10 })

    page2Response.assertStatus(200)
    const page2Body = page2Response.body()
    assert.equal(page2Body.data.length, 5)
    assert.equal(page2Body.meta.currentPage, 2)
  })

  test('cards - should only return cards from main folio, not secondary folios', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const secondaryFolio = await FolioFactory.merge({
      userId,
      isRoot: false,
    }).create()

    const cards = await CardFactory.createMany(3)

    await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: mainFolio.id,
      occurrence: 1,
    }).create()

    // Add cards to secondary folio (should not be returned in main folio cards)
    await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: secondaryFolio.id,
      occurrence: 2,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: secondaryFolio.id,
      occurrence: 1,
    }).create()

    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 1)
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, cards[0].id)
  })

  test('cards - should validate query parameters', async ({ client }) => {
    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 'invalid', limit: 'invalid' })

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_VALIDATION_ERROR',
    })
  })

  test('cards - should return 404 when user has no main folio', async ({ client }) => {
    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('cards - should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/folios/cards').qs({ page: 1, limit: 10 })

    response.assertStatus(401)
  })
})
