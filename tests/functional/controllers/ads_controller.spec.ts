import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { createReadStream } from 'node:fs'
import fs from 'node:fs'
import app from '@adonisjs/core/services/app'

import AdService from '#services/ad_service'
import FileService from '#services/file_service'
import CloudinaryApiClient from '#clients/cloudinary_api_client'
import { CardFactory } from '#database/factories/card'
import { CertificateFactory } from '#database/factories/certificate'
import { CardConditionBasicFactory } from '#database/factories/card_condition'
import { CardFinishBasicFactory } from '#database/factories/card_finish'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { GradeFactory } from '#database/factories/grade'

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
})
