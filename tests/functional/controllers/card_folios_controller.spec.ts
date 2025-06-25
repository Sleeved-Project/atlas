import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import { FolioFactory } from '#database/factories/folio'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import CardFolio from '#models/card_folio'
import { CardFolioFactory } from '#database/factories/card_folio'

test.group('CardFolios controller', (group) => {
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

    const response = await client
      .post('/api/v1/card-folios/collect')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ cardId: 'base1-1' })

    console.log('Response:', response.body())

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Card added to your main folio successfully',
    })

    const cardFolio = await CardFolio.query()
      .where('folio_id', rootFolio.id)
      .where('card_id', 'base1-1')
      .first()

    assert.exists(cardFolio)
    assert.equal(cardFolio?.folioId, rootFolio.id)
    assert.equal(cardFolio?.cardId, 'base1-1')
    assert.equal(cardFolio?.occurence, 1)
  }).pin()

  // test('collect - it should return conflict same card again', async ({ client, assert }) => {
  //   const userId = TEST_AUTH_USER_ID

  //   const rootFolio = await FolioFactory.merge({
  //     userId,
  //     name: 'root',
  //     isRoot: true,
  //   }).create()

  //   await CardFolioFactory.merge({
  //     cardId: 'base1-1',
  //     folioId: rootFolio.id,
  //     occurence: 1,
  //   }).create()

  //   const response = await client
  //     .post('/api/v1/card-folios/collect')
  //     .header('Authorization', 'Bearer fake-token-for-testing')
  //     .json({ cardId: 'base1-1' })

  //   response.assertStatus(409)

  //   const cardFolio = await CardFolio.query()
  //     .where('folio_id', rootFolio.id)
  //     .where('card_id', 'base1-1')
  //     .first()

  //   assert.exists(cardFolio)
  //   assert.equal(cardFolio?.occurence, 1)
  // })

  // test('collect - it should return 404 for non-existent card', async ({ client }) => {
  //   const userId = TEST_AUTH_USER_ID

  //   await FolioFactory.merge({
  //     userId,
  //     name: 'root',
  //     isRoot: true,
  //   }).create()

  //   const response = await client
  //     .post('/api/v1/card-folios/collect')
  //     .header('Authorization', 'Bearer fake-token-for-testing')
  //     .json({ cardId: 'non-existent-card-id' })

  //   response.assertStatus(404)
  //   response.assertBodyContains({
  //     message: 'Card not found',
  //     code: 'E_ROW_NOT_FOUND',
  //   })
  // })

  // test('collect - it should validate the request payload', async ({ client }) => {
  //   const response = await client
  //     .post('/api/v1/card-folios/collect')
  //     .header('Authorization', 'Bearer fake-token-for-testing')
  //     .json({})

  //   response.assertStatus(422)
  // })

  // test('collect - it should require authentication', async ({ client }) => {
  //   const response = await client.post('/api/v1/card-folios/collect').json({ cardId: 'base1-1' })
  //   response.assertStatus(401)
  // })
})
