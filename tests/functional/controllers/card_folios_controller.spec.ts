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

test.group('Folio controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
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
      .post('/api/v1/folios/cards/collect')
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
      .post('/api/v1/folios/cards/collect')
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
      .post('/api/v1/folios/cards/collect')
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
      .post('/api/v1/folios/cards/collect')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({})

    response.assertStatus(422)
  })

  test('collect - it should require authentication', async ({ client }) => {
    const response = await client.post('/api/v1/folios/cards/collect').json({ cardId: 'base1-1' })
    response.assertStatus(401)
  })

  test('occurrence - it should update card occurrence in user main folio', async ({
    client,
    assert,
  }) => {
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

    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: rootFolio.id,
      occurrence: 2,
    }).create()

    const response = await client
      .patch(`/api/v1/folios/cards/${card.id}/occurrence`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ occurrence: 5 })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Card occurence updated successfully',
    })

    const updatedCardFolio = await CardFolio.query()
      .where('folio_id', rootFolio.id)
      .where('card_id', card.id)
      .first()

    assert.exists(updatedCardFolio)
    assert.equal(updatedCardFolio?.occurrence, 5)
  })

  test('occurrence - it should return 404 when card folio does not exist', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
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
      .patch(`/api/v1/folios/cards/${card.id}/occurrence`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ occurrence: 3 })

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('occurrence - it should validate the request payload', async ({ client }) => {
    const response = await client
      .patch(`/api/v1/folios/cards/base1-1/occurrence`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({})

    response.assertStatus(422)
  })

  test('occurrence - it should require authentication', async ({ client }) => {
    const response = await client
      .patch(`/api/v1/folios/cards/base1-1/occurrence`)
      .json({ occurrence: 3 })

    response.assertStatus(401)
  })

  test('occurrence - it should return 404 for non-existent card', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .patch(`/api/v1/folios/cards/no-existent/occurrence`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ occurrence: 3 })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('delete - it should remove a card from user main folio', async ({ client, assert }) => {
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

    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: rootFolio.id,
      occurrence: 2,
    }).create()

    const response = await client
      .delete(`/api/v1/folios/cards/${card.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Card remove from main folio successfully',
    })

    const deletedCardFolio = await CardFolio.query()
      .where('folio_id', rootFolio.id)
      .where('card_id', card.id)
      .first()

    assert.isNull(deletedCardFolio)
  })

  test('delete - it should return 404 when card folio does not exist', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
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
      .delete(`/api/v1/folios/cards/${card.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('delete - it should return 404 for non-existent card', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .delete('/api/v1/folios/cards/non-existente')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('delete - it should require authentication', async ({ client }) => {
    const response = await client.delete('/api/v1/folios/cards/base1-1')

    response.assertStatus(401)
  })
})
