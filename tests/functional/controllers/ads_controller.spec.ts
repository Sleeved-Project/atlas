import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import fs, { createReadStream } from 'node:fs'
import sinon from 'sinon'
import CloudinaryApiClient from '#clients/cloudinary_api_client'
import { AdFactory } from '#database/factories/ad'
import { AdStatusFactory } from '#database/factories/ad_status'
import { ArtistFactory } from '#database/factories/artist'
import { CardFactory } from '#database/factories/card'
import { CardConditionBasicFactory, CardConditionFactory } from '#database/factories/card_condition'
import { CardFinishBasicFactory, CardFinishFactory } from '#database/factories/card_finish'
import { CertificateFactory } from '#database/factories/certificate'
import { GradeFactory } from '#database/factories/grade'
import { LegalityFactory } from '#database/factories/legality'
import { RarityFactory } from '#database/factories/rarity'
import { SetFactory } from '#database/factories/set'
import AdService from '#services/ad_service'
import FileService from '#services/file_service'

test.group('Ads Controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub
  let testImagePath: string
  let fileServiceSaveStub: sinon.SinonStub
  let fileServiceCleanupStub: sinon.SinonStub
  let cloudinaryUploadStub: sinon.SinonStub
  let createAdStub: sinon.SinonStub
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
    createAdStub = sandbox.stub(AdService.prototype, 'createAd')

    // Setup default stub behaviors
    fileServiceSaveStub.resolves('/tmp/test-file.png')
    cloudinaryUploadStub.resolves({
      publicId: 'public-id',
      url: 'https://cloudinary.com/image.png',
      width: 400,
      height: 300,
      format: 'png',
      resourceType: 'image',
    })
    createAdStub.resolves()
  })

  group.each.teardown(() => {
    sandbox.restore()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('store - should create ad with valid data', async ({ client }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.merge({ id: 'base1-1' }).create()
    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()

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
    sinon.assert.calledOnce(createAdStub)
    sinon.assert.calledOnce(fileServiceCleanupStub)

    sinon.assert.calledWith(
      createAdStub,
      TEST_AUTH_USER_ID,
      finish.id,
      condition.id,
      card.id,
      sinon.match.string, // recto URL
      sinon.match.string, // verso URL
      100.5,
      null
    )
  })

  test('store - should create ad with certificate if certificate exists', async ({ client }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const grade = await GradeFactory.create()
    const card = await CardFactory.merge({ id: 'base1-1' }).create()
    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()

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

    sinon.assert.calledWith(
      createAdStub,
      TEST_AUTH_USER_ID,
      finish.id,
      condition.id,
      card.id,
      sinon.match.string,
      sinon.match.string,
      100.5,
      certificate.id
    )
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
    const nonExistentCardId = 'base1-999'
    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()

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
        cardId: nonExistentCardId, // This card does not exist
        conditionId: condition.id,
        finishId: finish.id,
        price: 100.5,
      })

    response.assertStatus(404)
    response.assertBodyContains({ code: 'E_ROW_NOT_FOUND' })
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('store - should return 404 when certificate does not exist', async ({ client }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.merge({ id: 'base1-1' }).create()
    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()

    const nonExistentCertificateId = 'non-existent-certificate-id'

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
        certificateId: nonExistentCertificateId,
      })

    response.assertStatus(404)
    response.assertBodyContains({ code: 'E_ROW_NOT_FOUND' })
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('store - should return 401 when not authenticated', async ({ client }) => {
    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()

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
        cardId: 'base1-1',
        conditionId: condition.id,
        finishId: finish.id,
        price: 100.5,
      })

    response.assertStatus(401)
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
      .with('seller')
      .createMany(25)

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

  test('show - should return ad details for valid id', async ({ client, assert }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ id: 'base5' }).create()

    const card = await CardFactory.merge({
      id: 'base5-1',
      artistId: artist.id,
      rarityId: rarity.id,
      legalityId: legality.id,
      setId: set.id,
    }).create()

    const condition = await CardConditionBasicFactory.create()
    const finish = await CardFinishBasicFactory.create()
    const status = await AdStatusFactory.merge({ id: 5, label: 'Published' }).create()

    const ad = await AdFactory.merge({
      cardId: card.id,
      conditionId: condition.id,
      finishId: finish.id,
      statusId: status.id,
    })
      .with('seller')
      .create()

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
