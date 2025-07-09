import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import { FolioFactory } from '#database/factories/folio'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { CardFactory } from '#database/factories/card'
import { CardFolioFactory } from '#database/factories/card_folio'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { DateTime } from 'luxon'
import Folio from '#models/folio'

test.group('Child Folio controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('index - should return all child folios with statistics', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const childFolio1 = await FolioFactory.merge({
      userId,
      name: 'Collection 1',
      image: 'image1.jpg',
      isRoot: false,
    }).create()

    const childFolio2 = await FolioFactory.merge({
      userId,
      name: 'Collection 2',
      image: 'image2.jpg',
      isRoot: false,
    }).create()

    const cards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.0,
        updatedAt: DateTime.now(),
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({ updatedAt: DateTime.now() })
          .with('tcgPlayerPrices', 1, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge({ type: 'normal', market: 8.0 })
          )
      )
      .createMany(3)

    await CardFolioFactory.merge([
      { cardId: cards[0].id, folioId: childFolio1.id, occurrence: 2 },
      { cardId: cards[1].id, folioId: childFolio1.id, occurrence: 1 },
      { cardId: cards[2].id, folioId: childFolio2.id, occurrence: 3 },
    ]).createMany(3)

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 2)

    const folio1 = folios.find((f: Folio) => f.name === childFolio1.name)
    const folio2 = folios.find((f: Folio) => f.name === childFolio2.name)

    assert.exists(folio1)
    assert.exists(folio2)

    assert.properties(folio1, ['id', 'name', 'image', 'statistics'])
    assert.properties(folio1.statistics, ['totalCardsCount', 'cardMarketPrice', 'tcgPlayerPrice'])

    assert.equal(folio1.name, 'Collection 1')
    assert.equal(folio1.image, 'image1.jpg')
    assert.equal(folio1.statistics.totalCardsCount, 3) // 2 + 1 occurrences
    assert.equal(folio1.statistics.cardMarketPrice, '30.00') // (10*2) + (10*1)
    assert.equal(folio1.statistics.tcgPlayerPrice, '24.00') // (8*2) + (8*1)

    assert.equal(folio2.statistics.totalCardsCount, 3) // 3 occurrences
    assert.equal(folio2.statistics.cardMarketPrice, '30.00') // 10*3
    assert.equal(folio2.statistics.tcgPlayerPrice, '24.00') // 8*3
  })

  test('index - should return empty array when user has no child folios', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    // Create only main folio
    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 0)
  })

  test('index - should only return child folios, not main folio', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    await FolioFactory.merge({
      userId,
      name: 'Custom Collection',
      isRoot: false,
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 1)
    assert.equal(folios[0].name, 'Custom Collection')
  })

  test('index - should only return folios for authenticated user', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID
    const otherUserId = 'other-user-id'

    await FolioFactory.merge({
      userId,
      name: 'My Collection',
      isRoot: false,
    }).create()

    await FolioFactory.merge({
      userId: otherUserId,
      name: 'Other User Collection',
      isRoot: false,
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 1)
    assert.equal(folios[0].name, 'My Collection')
  })

  test('index - should handle folios without cards', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'Empty Collection',
      image: 'empty.jpg',
      isRoot: false,
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 1)

    const folio = folios[0]
    assert.equal(folio.name, 'Empty Collection')
    assert.equal(folio.image, 'empty.jpg')
    assert.equal(folio.statistics.totalCardsCount, 0)
    assert.equal(folio.statistics.cardMarketPrice, '0.00')
    assert.equal(folio.statistics.tcgPlayerPrice, '0.00')
  })

  test('index - should return folios ordered by creation date desc', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'First Collection',
      isRoot: false,
      createdAt: DateTime.now().minus({ days: 1 }),
    }).create()

    await FolioFactory.merge({
      userId,
      name: 'Second Collection',
      isRoot: false,
      createdAt: DateTime.now(),
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 2)

    assert.equal(folios[0].name, 'Second Collection')
    assert.equal(folios[1].name, 'First Collection')
  })

  test('index - should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/folios')

    response.assertStatus(401)
  })

  test('cards - should return paginated cards from specific child folio', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const childFolio = await FolioFactory.merge({
      userId,
      name: 'My Custom Collection',
      isRoot: false,
    }).create()

    const otherChildFolio = await FolioFactory.merge({
      userId,
      name: 'Other Collection',
      isRoot: false,
    }).create()

    const cards = await CardFactory.createMany(3)

    // Add cards to target child folio
    await CardFolioFactory.merge([
      { cardId: cards[0].id, folioId: childFolio.id, occurrence: 2 },
      { cardId: cards[1].id, folioId: childFolio.id, occurrence: 1 },
    ]).createMany(2)

    // Add card to other folio (should not be returned)
    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: otherChildFolio.id,
      occurrence: 3,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${childFolio.id}/cards`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.properties(body, ['meta', 'data'])
    assert.properties(body.meta, ['total', 'currentPage', 'perPage'])
    assert.equal(body.meta.total, 2)
    assert.equal(body.meta.currentPage, 1)

    assert.isArray(body.data)
    assert.lengthOf(body.data, 2)

    const firstCardFolio = body.data[0]
    assert.properties(firstCardFolio, ['id', 'occurrence', 'card'])
    assert.properties(firstCardFolio.card, ['id', 'imageSmall'])

    const cardIds = body.data.map((cardFolio: any) => cardFolio.card.id)
    assert.includeMembers(cardIds, [cards[0].id, cards[1].id])
    assert.notInclude(cardIds, cards[2].id) // Should not include card from other folio

    const cardFolioWithOccurrence2 = body.data.find((cf: any) => cf.card.id === cards[0].id)
    const cardFolioWithOccurrence1 = body.data.find((cf: any) => cf.card.id === cards[1].id)

    assert.equal(cardFolioWithOccurrence2.occurrence, 2)
    assert.equal(cardFolioWithOccurrence1.occurrence, 1)
  })

  test('cards - should return 403 when folio is not owned by user', async ({ client }) => {
    const otherUserId = 'other-user-id'

    const otherUserFolio = await FolioFactory.merge({
      userId: otherUserId,
      name: 'Other User Collection',
      isRoot: false,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${otherUserFolio.id}/cards`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(403)
    response.assertBodyContains({
      code: 'E_FOLIO_NOT_OWNED',
    })
  })

  test('cards - should return 422 when trying to access main folio cards', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    const mainFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${mainFolio.id}/cards`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_NOT_CHILD_FOLIO',
    })
  })
})
