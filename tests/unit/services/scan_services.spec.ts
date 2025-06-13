import { test } from '@japa/runner'
import sinon from 'sinon'
import fs from 'node:fs'
import ScanService from '#services/scan_service'
import IrisApiClient from '#clients/iris_api_client'
import IrisMapper from '#mappers/iris_mapper'
import { ScanAnalyseIrisResponse, ScanCardInfoDTO } from '#types/iris_type'
import { IrisException } from '#exceptions/iris_exception'

test.group('ScanService', (group) => {
  // Déclaration des stubs
  let readFileSyncStub: sinon.SinonStub
  let scanCardStub: sinon.SinonStub
  let mapperStub: sinon.SinonStub
  let fileConstructorStub: sinon.SinonStub
  let formDataAppendStub: sinon.SinonStub

  // Mock du constructeur FormData
  let originalFormData: typeof FormData

  group.each.setup(() => {
    // Sauvegarde de la classe FormData originale
    originalFormData = global.FormData

    // Mock de fs
    readFileSyncStub = sinon.stub(fs, 'readFileSync')

    // Mock du constructeur File
    fileConstructorStub = sinon.stub(global, 'File').callsFake(function (args) {
      return { name: args[1], type: args[2]?.type || 'application/octet-stream' }
    })

    // Mock de FormData
    formDataAppendStub = sinon.stub()
    // @ts-ignore - Ignores TypeScript error for global FormData
    global.FormData = function () {
      return {
        append: formDataAppendStub,
      }
    }

    // Mock d'IrisApiClient
    scanCardStub = sinon.stub(IrisApiClient.prototype, 'scanCard')

    // Mock du mapper
    mapperStub = sinon.stub(IrisMapper, 'scanAnalyseIrisResponseToScanCardInfoDTO')
  })

  group.each.teardown(() => {
    // Restauration des fonctions d'origine
    sinon.restore()

    // Restauration de FormData
    global.FormData = originalFormData
  })

  test('getAnalyseResults - should return analysis results successfully', async ({ assert }) => {
    // Arrange
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'
    const fileBuffer = Buffer.from('fake-image-data')

    // Mock conforme au type ScanAnalyseIrisResponse
    const mockScanResponse: ScanAnalyseIrisResponse = {
      message: 'Success',
      cards: [
        {
          card_hash: 'hash123',
          card_index: 0,
          is_similar: true,
          similarity_percentage: 95,
          matched_card_id: '123',
          matched_card_name: 'Test Card',
          top_n_matches: [
            {
              card_id: '123',
              card_name: 'Test Card',
              similarity_percentage: 95,
              hamming_distance: 5,
            },
          ],
        },
      ],
    }

    // Mock conforme au type ScanCardInfoDTO
    const expectedResult: ScanCardInfoDTO[] = [
      {
        id: '123',
        similarity: 95,
      },
    ]

    // Configuration des stubs
    readFileSyncStub.withArgs(filePath).returns(fileBuffer)
    scanCardStub.resolves(mockScanResponse)
    mapperStub.withArgs(mockScanResponse).returns(expectedResult)

    // Act
    const scanService = new ScanService()
    const result = await scanService.getAnalyseResults(filePath, fileName, fileType)

    // Assert
    assert.deepEqual(result, expectedResult)

    // Vérifier que les fonctions ont été appelées avec les bons arguments
    sinon.assert.calledWith(readFileSyncStub, filePath)
    sinon.assert.calledWith(fileConstructorStub, [fileBuffer], fileName, { type: fileType })
    sinon.assert.called(formDataAppendStub)
    sinon.assert.called(scanCardStub)
    sinon.assert.calledWith(mapperStub, mockScanResponse)
  })

  test('getAnalyseResults - should use the default type if fileType is not provided', async ({
    assert,
  }) => {
    // Arrange
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileBuffer = Buffer.from('fake-image-data')

    const mockScanResponse: ScanAnalyseIrisResponse = {
      message: 'Success',
      cards: [
        {
          card_hash: 'hash123',
          card_index: 0,
          is_similar: true,
          similarity_percentage: 95,
          matched_card_id: '123',
          matched_card_name: 'Test Card',
          top_n_matches: [
            {
              card_id: '123',
              card_name: 'Test Card',
              similarity_percentage: 95,
              hamming_distance: 5,
            },
          ],
        },
      ],
    }

    const expectedResult: ScanCardInfoDTO[] = [
      {
        id: '123',
        similarity: 95,
      },
    ]

    // Configuration des stubs
    readFileSyncStub.withArgs(filePath).returns(fileBuffer)
    scanCardStub.resolves(mockScanResponse)
    mapperStub.returns(expectedResult)

    // Act
    const scanService = new ScanService()
    const result = await scanService.getAnalyseResults(filePath, fileName, undefined)

    // Assert
    assert.deepEqual(result, expectedResult)
    sinon.assert.calledWith(fileConstructorStub, [fileBuffer], fileName, {
      type: 'application/octet-stream',
    })
  })

  test('getAnalyseResults - should propagate the exception thrown by irisApiClient', async ({
    assert,
  }) => {
    // Arrange
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'
    const errorMessage = 'Iris service unavailable'

    // Configuration des stubs
    readFileSyncStub.returns(Buffer.from('fake-image-data'))
    scanCardStub.rejects(new IrisException(errorMessage))

    // Act & Assert
    const scanService = new ScanService()

    await assert.rejects(async () => {
      await scanService.getAnalyseResults(filePath, fileName, fileType)
    }, 'Iris service unavailable')
  })
})
