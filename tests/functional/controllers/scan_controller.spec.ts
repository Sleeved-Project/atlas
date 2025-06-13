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

test.group('Scan controller', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let scanServiceStub: sinon.SinonStub
  let cardServiceStub: sinon.SinonStub
  let rmSyncStub: sinon.SinonStub

  let testImagePath: string

  group.each.setup(async () => {
    rmSyncStub = sinon.stub(fs, 'rmSync')

    const uploadsPath = app.makePath('storage/uploads')
    try {
      await fs.promises.mkdir(uploadsPath, { recursive: true })
    } catch (error) {}

    const fixturesPath = app.makePath('tests/fixtures')
    try {
      await fs.promises.mkdir(fixturesPath, { recursive: true })
    } catch (error) {}

    testImagePath = app.makePath('tests/fixtures/test-image.png')

    scanServiceStub = sinon.stub(ScanService.prototype, 'getAnalyseResults')
    cardServiceStub = sinon.stub(CardService.prototype, 'getCardScanResulInfosById')
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
      console.error('Erreur lors du nettoyage des fichiers de test:', error)
    }
  })

  test('analyze - should analyze image and return card scan results', async ({
    client,
    assert,
  }) => {
    const mockScanResults = [{ id: 'base1-1', similarity: 0.95 }] // 'similarity' au lieu de 'confidence'

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

    sinon.assert.calledOnce(scanServiceStub)
    sinon.assert.calledWith(cardServiceStub, 'base1-1')
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

    sinon.assert.calledOnce(scanServiceStub)
    sinon.assert.calledWith(cardServiceStub.firstCall, 'base1-1')
    sinon.assert.calledWith(cardServiceStub.secondCall, 'base1-2')
  })

  test('analyze - should always delete the file, even in case of error', async ({
    client,
    assert,
  }) => {
    scanServiceStub.rejects(new Error('Erreur de service simulée'))

    rmSyncStub.reset()

    const response = await client
      .post('/api/v1/scan/analyze')
      .file('file', createReadStream(testImagePath), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    response.assertStatus(500)

    assert.isTrue(rmSyncStub.called, 'rmSync devrait être appelé pour supprimer le fichier')

    const filePath = rmSyncStub.firstCall.args[0]
    assert.isTrue(
      filePath.startsWith(app.makePath('storage/uploads')),
      `Le fichier supprimé devrait être dans le répertoire uploads`
    )
  })
})
