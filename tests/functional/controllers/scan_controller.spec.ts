import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import ScanService from '#services/scan_service'
import CardService from '#services/card_service'
import { createReadStream } from 'node:fs'
import fs from 'node:fs'
import app from '@adonisjs/core/services/app'
import { FileUploadException } from '#exceptions/file_upload_exception'
import { errors as lucidErrors } from '@adonisjs/lucid'
import FileService from '#services/file_service'

test.group('Scan controller', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let scanServiceStub: sinon.SinonStub
  let cardServiceStub: sinon.SinonStub
  let fileServiceStub: sinon.SinonStub
  let fileServiceCleanupStub: sinon.SinonStub
  let getIdentifyResultStub: sinon.SinonStub
  let getMinimalCardDetailByIdStub: sinon.SinonStub

  let testImagePath: string

  group.each.setup(async () => {
    // Setup test image path
    testImagePath = app.makePath('tests/fixtures/test-image.png')

    // Create stubs
    scanServiceStub = sinon.stub(ScanService.prototype, 'getAnalyseResults')
    cardServiceStub = sinon.stub(CardService.prototype, 'getCardScanResulInfosById')
    fileServiceStub = sinon.stub(FileService.prototype, 'saveFile')
    fileServiceCleanupStub = sinon.stub(FileService.prototype, 'cleanup')
    getIdentifyResultStub = sinon.stub(ScanService.prototype, 'getIdentifyResult')
    getMinimalCardDetailByIdStub = sinon.stub(CardService.prototype, 'getMinimalCardDetailById')

    // Setup default stub behavior
    fileServiceStub.resolves('/tmp/test-file.png')
  })

  group.each.teardown(async () => {
    sinon.restore()
    const uploadsPath = app.makePath('storage/uploads')
    try {
      const files = await fs.promises.readdir(uploadsPath)

      for (const file of files) {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
          await fs.promises.unlink(`${uploadsPath}/${file}`)
        }
      }
    } catch (error) {
      console.error('Error while cleaning test files:', error)
    }
  })

  test('analyze - should analyze image and return card scan results', async ({
    client,
    assert,
  }) => {
    const mockScanResults = [{ id: 'base1-1', similarity: 0.95 }]

    const mockCardInfo = {
      id: 'base1-1',
      imageLarge: 'https://example.com/bulbasaur.png',
      imageSmall: 'https://example.com/bulbasaur-small.png',
      cardMarketPrices: [
        {
          id: 1,
          trendPrice: 10.5,
          reverseHoloTrend: 15.75,
          url: 'https://cardmarket.com/card/base1-1',
        },
      ],
      tcgPlayerReportings: [
        {
          id: 1,
          url: 'https://tcgplayer.com/card/base1-1',
          tcgPlayerPrices: [
            { id: 1, type: 'normal', market: 12.25 },
            { id: 2, type: 'holofoil', market: 18.5 },
          ],
        },
      ],
    }

    scanServiceStub.resolves(mockScanResults)
    cardServiceStub.withArgs('base1-1').resolves(mockCardInfo)

    const response = await client
      .post('/api/v1/scan/analyze')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(200)

    const results = response.body()
    assert.isArray(results)
    assert.isNotEmpty(results)

    const firstResult = results[0]
    assert.properties(firstResult, [
      'id',
      'imageSmall',
      'imageLarge',
      'bestTrendPrice',
      'similarity',
    ])
    assert.equal(firstResult.id, 'base1-1')
    assert.equal(firstResult.similarity, 0.95)
    assert.equal(firstResult.imageSmall, 'https://example.com/bulbasaur-small.png')
    assert.equal(firstResult.imageLarge, 'https://example.com/bulbasaur.png')

    sinon.assert.calledOnce(fileServiceStub)
    sinon.assert.calledOnce(scanServiceStub)
    sinon.assert.calledWith(cardServiceStub, 'base1-1')
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('analyze - should handle file upload error', async ({ client }) => {
    scanServiceStub.rejects(new FileUploadException('Failed to upload file'))

    const response = await client
      .post('/api/v1/scan/analyze')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(422)
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('analyze - should handle not found error', async ({ client }) => {
    const mockScanResults = [{ id: 'non-existent-id', similarity: 0.95 }]

    scanServiceStub.resolves(mockScanResults)

    const notFoundError = new lucidErrors.E_ROW_NOT_FOUND()
    cardServiceStub.withArgs('non-existent-id').rejects(notFoundError)

    const response = await client
      .post('/api/v1/scan/analyze')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Row not found',
      code: 'E_ROW_NOT_FOUND',
    })
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('analyze - should handle multiple cards in scan results', async ({ client, assert }) => {
    const mockScanResults = [
      { id: 'base1-1', similarity: 0.95 },
      { id: 'base1-2', similarity: 0.87 },
    ]

    const mockCardInfo1 = {
      id: 'base1-1',
      imageLarge: 'https://example.com/bulbasaur.png',
      imageSmall: 'https://example.com/bulbasaur-small.png',
      cardMarketPrices: [
        {
          id: 1,
          trendPrice: 10.5,
          reverseHoloTrend: 15.75,
          url: 'https://cardmarket.com/card/base1-1',
        },
      ],
      tcgPlayerReportings: [
        {
          id: 1,
          url: 'https://tcgplayer.com/card/base1-1',
          tcgPlayerPrices: [
            { id: 1, type: 'normal', market: 12.25 },
            { id: 2, type: 'holofoil', market: 18.5 },
          ],
        },
      ],
    }

    const mockCardInfo2 = {
      id: 'base1-2',
      imageLarge: 'https://example.com/ivysaur.png',
      imageSmall: 'https://example.com/ivysaur-small.png',
      cardMarketPrices: [
        {
          id: 2,
          trendPrice: 8.75,
          reverseHoloTrend: 12.0,
          url: 'https://cardmarket.com/card/base1-2',
        },
      ],
      tcgPlayerReportings: [
        {
          id: 2,
          url: 'https://tcgplayer.com/card/base1-2',
          tcgPlayerPrices: [
            { id: 3, type: 'normal', market: 9.5 },
            { id: 4, type: 'holofoil', market: 14.25 },
          ],
        },
      ],
    }

    scanServiceStub.resolves(mockScanResults)
    cardServiceStub.withArgs('base1-1').resolves(mockCardInfo1)
    cardServiceStub.withArgs('base1-2').resolves(mockCardInfo2)

    const response = await client
      .post('/api/v1/scan/analyze')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(200)

    const results = response.body()
    assert.isArray(results)
    assert.lengthOf(results, 2)

    assert.equal(results[0].id, 'base1-1')
    assert.equal(results[0].similarity, 0.95)
    assert.equal(results[0].imageSmall, 'https://example.com/bulbasaur-small.png')

    assert.equal(results[1].id, 'base1-2')
    assert.equal(results[1].similarity, 0.87)
    assert.equal(results[1].imageSmall, 'https://example.com/ivysaur-small.png')

    sinon.assert.calledOnce(fileServiceStub)
    sinon.assert.calledOnce(scanServiceStub)
    sinon.assert.calledWith(cardServiceStub.firstCall, 'base1-1')
    sinon.assert.calledWith(cardServiceStub.secondCall, 'base1-2')
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('analyze - should always delete the file, even in case of error', async ({
    client,
    assert,
  }) => {
    scanServiceStub.rejects(new Error('Simulated service error'))

    rmSyncStub.reset()

    const response = await client
      .post('/api/v1/scan/analyze')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(500)
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('identify - should identify card and return details', async ({ client, assert }) => {
    const extractedTempImageUrl = '/api/v1/uploads/test-file.png'

    const cardIdentificationResult = {
      id: 'base1-1',
      similarity: 0.95,
      extractedTempImageUrl: extractedTempImageUrl,
    }

    const temporaryFilePath = '/tmp/test-file.png'

    const mockCardDetails = {
      id: 'base1-1',
      name: 'Bulbasaur',
      imageLarge: 'https://example.com/bulbasaur.png',
      imageSmall: 'https://example.com/bulbasaur-small.png',
      number: '1',
      setId: 'base1',
      set: {
        id: 'base1',
        name: 'Base Set',
        imageSymbol: 'https://example.com/base-symbol.png',
      },
    }

    fileServiceStub.resolves(temporaryFilePath)
    getIdentifyResultStub.resolves(cardIdentificationResult)
    getMinimalCardDetailByIdStub.withArgs('base1-1').resolves(mockCardDetails)

    const response = await client
      .post('/api/v1/scan/identify')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(200)
    const result = response.body()

    assert.properties(result, [
      'id',
      'name',
      'similarity',
      'potentialMatchedCard',
      'extractedTempImageUrl',
    ])

    assert.equal(result.id, 'base1-1')
    assert.equal(result.name, 'Bulbasaur')
    assert.equal(result.similarity, 0.95)
    assert.equal(result.extractedTempImageUrl, extractedTempImageUrl)

    assert.isString(result.potentialMatchedCard)
    assert.equal(result.potentialMatchedCard, 'https://example.com/bulbasaur-small.png')

    sinon.assert.calledOnce(fileServiceStub)
    sinon.assert.calledOnce(getIdentifyResultStub)
    sinon.assert.calledOnce(getMinimalCardDetailByIdStub)
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('identify - should return 422 when no card is matched', async ({ client }) => {
    getIdentifyResultStub.resolves(null)

    const response = await client
      .post('/api/v1/scan/identify')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_IRIS_EXCEPTION',
      message: 'No matching cards found for the scan',
    })

    sinon.assert.calledOnce(fileServiceStub)
    sinon.assert.calledOnce(getIdentifyResultStub)
    sinon.assert.notCalled(getMinimalCardDetailByIdStub)
    sinon.assert.calledOnce(fileServiceCleanupStub)
  })

  test('identify - should return 404 when card exists in API but not in database', async ({
    client,
  }) => {
    const cardIdentificationResult = { id: 'non-existent-id', similarity: 0.95 }
    getIdentifyResultStub.resolves(cardIdentificationResult)

    const notFoundError = new lucidErrors.E_ROW_NOT_FOUND()
    getMinimalCardDetailByIdStub.withArgs('non-existent-id').rejects(notFoundError)

    const response = await client
      .post('/api/v1/scan/identify')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Row not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('identify - should handle validation errors', async ({ client }) => {
    const response = await client.post('/api/v1/scan/identify')

    response.assertStatus(422)
    response.assertBodyContains({ code: 'E_VALIDATION_ERROR' })

    sinon.assert.notCalled(getIdentifyResultStub)
    sinon.assert.notCalled(getMinimalCardDetailByIdStub)
  })

  test('identify - should always clean up files even when errors occur', async ({ client }) => {
    getIdentifyResultStub.rejects(new Error('Unexpected service error'))

    const response = await client
      .post('/api/v1/scan/identify')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(500)

    sinon.assert.calledOnce(fileServiceCleanupStub)
  })
})
