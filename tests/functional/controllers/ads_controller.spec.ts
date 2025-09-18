import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import fs, { createReadStream } from 'node:fs'
import sinon from 'sinon'
import CloudinaryApiClient from '#clients/cloudinary_api_client'

import { ArtistFactory } from '#database/factories/artist'
import { CardFactory } from '#database/factories/card'
import { CardConditionFactory } from '#database/factories/card_condition'
import { CardFinishFactory } from '#database/factories/card_finish'
import { LegalityFactory } from '#database/factories/legality'
import { RarityFactory } from '#database/factories/rarity'
import { SetFactory } from '#database/factories/set'
import FileService from '#services/file_service'
import { AdStatusFactory } from '#database/factories/ad_status'
import { CertificateFactory } from '#database/factories/certificate'
import { GradeFactory } from '#database/factories/grade'
import {
  NO_EXISTING_CARD_ID,
  NO_EXISTING_CERTIFICATE_ID,
  NO_EXISTING_QUERY_STRING,
} from '#tests/mocks/non_existing_mock'
import { AdFactory } from '#database/factories/ad'

test.group('Ads Controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub
  let testImagePath: string
  let fileServiceSaveStub: sinon.SinonStub
  let fileServiceCleanupStub: sinon.SinonStub
  let cloudinaryUploadStub: sinon.SinonStub
  let sandbox: sinon.SinonSandbox

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  group.each.setup(async () => {
    sandbox = sinon.createSandbox()

    const fixturesPath = app.makePath('tests/fixtures')
    try {
      await fs.promises.mkdir(fixturesPath, { recursive: true })
    } catch (error) {}

    testImagePath = app.makePath('tests/fixtures/test-image.png')

    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, Buffer.from('fake image data'))
    }

    fileServiceSaveStub = sandbox.stub(FileService.prototype, 'saveFile')
    fileServiceCleanupStub = sandbox.stub(FileService.prototype, 'cleanup')
    cloudinaryUploadStub = sandbox.stub(CloudinaryApiClient.prototype, 'uploadFile')

    fileServiceSaveStub.resolves('/tmp/test-file.png')
    cloudinaryUploadStub.resolves({
      publicId: 'public-id',
      url: 'https://cloudinary.com/image.png',
      width: 400,
      height: 300,
      format: 'png',
      resourceType: 'image',
    })
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('store - should create ad with valid data', async ({ client }) => {
    const card = await CardFactory.with('artist', 1)
      .with('rarity', 1)
      .with('legality', 1)
      .with('set', 1, (set) => set.with('legality', 1))
      .create()
    await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()

    const response = await client
      .post('/api/v1/ads')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .file('rectoFile', createReadStream(testImagePath), {
        filename: 'recto.png',
        contentType: 'image/png',
      })
      .file('versoFile', createReadStream(testImagePath), {
        filename: 'verso.png',
        contentType: 'image/png',
      })
      .fields({
        cardId: card.id,
        conditionId: condition.id,
        finishId: finish.id,
        price: 100.5,
      })

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Ad published successfully' })

    sinon.assert.calledTwice(fileServiceSaveStub)
    sinon.assert.calledTwice(cloudinaryUploadStub)
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('store - should create ad with certificate if certificate exists', async ({ client }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      artistId: artist.id,
      rarityId: rarity.id,
      setId: set.id,
      legalityId: legality.id,
    }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    const grade = await GradeFactory.create()

    const certificate = await CertificateFactory.merge({
      cardId: card.id,
      certifiedById: TEST_AUTH_USER_ID,
      gradeId: grade.id,
    }).create()

    const response = await client
      .post('/api/v1/ads')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .file('rectoFile', createReadStream(testImagePath), {
        filename: 'recto.png',
        contentType: 'image/png',
      })
      .file('versoFile', createReadStream(testImagePath), {
        filename: 'verso.png',
        contentType: 'image/png',
      })
      .fields({
        cardId: card.id,
        conditionId: condition.id,
        finishId: finish.id,
        price: 100.5,
        certificateId: certificate.id,
      })

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Ad published successfully' })
  })

  test('store - should return 422 with invalid data types', async ({ client }) => {
    const response = await client
      .post('/api/v1/ads')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .file('rectoFile', createReadStream(testImagePath), {
        filename: 'recto.png',
        contentType: 'image/png',
      })
      .file('versoFile', createReadStream(testImagePath), {
        filename: 'verso.png',
        contentType: 'image/png',
      })
      .fields({
        cardId: 'base1-1',
        price: 'not-a-number',
        conditionId: 'abc',
        finishId: -5,
      })

    response.assertStatus(422)
    response.assertBodyContains({ code: 'E_VALIDATION_ERROR' })
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('store - should return 422 with missing required fields', async ({ client }) => {
    const response = await client
      .post('/api/v1/ads')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .file('rectoFile', createReadStream(testImagePath), {
        filename: 'recto.png',
        contentType: 'image/png',
      })
      .file('versoFile', createReadStream(testImagePath), {
        filename: 'verso.png',
        contentType: 'image/png',
      })
      .fields({
        // Missing cardId, conditionId, finishId, price
      })

    response.assertStatus(422)
    response.assertBodyContains({ code: 'E_VALIDATION_ERROR' })
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('store - should return 404 when card does not exist', async ({ client }) => {
    await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()

    const response = await client
      .post('/api/v1/ads')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .file('rectoFile', createReadStream(testImagePath), {
        filename: 'recto.png',
        contentType: 'image/png',
      })
      .file('versoFile', createReadStream(testImagePath), {
        filename: 'verso.png',
        contentType: 'image/png',
      })
      .fields({
        cardId: NO_EXISTING_CARD_ID,
        conditionId: condition.id,
        finishId: finish.id,
        price: 100.5,
      })

    response.assertStatus(404)
    response.assertBodyContains({ code: 'E_ROW_NOT_FOUND' })
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('store - should return 404 when certificate does not exist', async ({ client }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      artistId: artist.id,
      rarityId: rarity.id,
      setId: set.id,
      legalityId: legality.id,
    }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()

    const response = await client
      .post('/api/v1/ads')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .file('rectoFile', createReadStream(testImagePath), {
        filename: 'recto.png',
        contentType: 'image/png',
      })
      .file('versoFile', createReadStream(testImagePath), {
        filename: 'verso.png',
        contentType: 'image/png',
      })
      .fields({
        cardId: card.id,
        conditionId: condition.id,
        finishId: finish.id,
        price: 100.5,
        certificateId: NO_EXISTING_CERTIFICATE_ID,
      })

    response.assertStatus(404)
    response.assertBodyContains({ code: 'E_ROW_NOT_FOUND' })
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('store - should return 401 when not authenticated', async ({ client }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      artistId: artist.id,
      rarityId: rarity.id,
      setId: set.id,
      legalityId: legality.id,
    }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()

    const response = await client
      .post('/api/v1/ads')
      .file('rectoFile', createReadStream(testImagePath), {
        filename: 'recto.png',
        contentType: 'image/png',
      })
      .file('versoFile', createReadStream(testImagePath), {
        filename: 'verso.png',
        contentType: 'image/png',
      })
      .fields({
        cardId: card.id,
        conditionId: condition.id,
        finishId: finish.id,
        price: 100.5,
      })

    response.assertStatus(401)
  })

  test('index - should return paginated ads', async ({ client, assert }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      artistId: artist.id,
      rarityId: rarity.id,
      setId: set.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    await AdFactory.merge({
      cardId: card.id,
      finishId: finish.id,
      statusId: adStatus.id,
      conditionId: condition.id,
      sellerId: TEST_AUTH_USER_ID,
    }).createMany(15)

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
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      artistId: artist.id,
      rarityId: rarity.id,
      setId: set.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    await AdFactory.merge({
      cardId: card.id,
      finishId: finish.id,
      statusId: adStatus.id,
      conditionId: condition.id,
      sellerId: TEST_AUTH_USER_ID,
    }).createMany(25)

    const response = await client
      .get('/api/v1/ads')
      .qs({ page: 2, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().data.length, 10)
    assert.equal(response.body().meta.currentPage, 2)
    assert.equal(response.body().meta.total, 25)
  })

  test('search - should filter ads by card name', async ({ client, assert }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()

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

    const adStatus = await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()

    await AdFactory.merge({
      cardId: card1.id,
      finishId: finish.id,
      statusId: adStatus.id,
      conditionId: condition.id,
      sellerId: TEST_AUTH_USER_ID,
    }).create()

    await AdFactory.merge({
      cardId: card2.id,
      finishId: finish.id,
      statusId: adStatus.id,
      conditionId: condition.id,
      sellerId: TEST_AUTH_USER_ID,
    }).create()

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
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      artistId: artist.id,
      rarityId: rarity.id,
      setId: set.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    await AdFactory.merge({
      cardId: card.id,
      finishId: finish.id,
      statusId: adStatus.id,
      conditionId: condition.id,
      sellerId: TEST_AUTH_USER_ID,
    }).createMany(3)

    const response = await client
      .get('/api/v1/ads/search')
      .qs({ query: NO_EXISTING_QUERY_STRING })
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

  test('show - should return ad details for valid id', async ({ client, assert }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      artistId: artist.id,
      rarityId: rarity.id,
      setId: set.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    const ad = await AdFactory.merge({
      cardId: card.id,
      finishId: finish.id,
      statusId: adStatus.id,
      conditionId: condition.id,
      sellerId: TEST_AUTH_USER_ID,
    }).create()

    const response = await client
      .get(`/api/v1/ads/${ad.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().id, ad.id)
    assert.equal(response.body().card.id, card.id)
  })

  test('show - should return 404 for non-existent ad', async ({ client }) => {
    const response = await client
      .get('/api/v1/ads/non-existent-ad-id')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({ code: 'E_ROW_NOT_FOUND' })
  })

  test('show - should return 401 when not authenticated', async ({ client }) => {
    const response = await client.get('/api/v1/ads/some-ad-id')
    response.assertStatus(401)
  })
})
