import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import ScanService from '#services/scan_service'
import IrisApiClient from '#clients/iris_api_client'
import IrisMapper from '#mappers/iris_mapper'
import { ScanAnalyseIrisResponse, ScanCardInfoDTO } from '#types/iris_type'
import { IrisException } from '#exceptions/iris_exception'
import FileService from '#services/file_service'

test.group('ScanService', (group) => {
  let mockFileService: FileService
  let scanCardStub: sinon.SinonStub
  let mapperStub: sinon.SinonStub
  let mockFormData: FormData

  group.each.setup(() => {
    mockFileService = sinon.createStubInstance(FileService) as unknown as FileService

    // Simple formData mock
    mockFormData = { append: sinon.stub() } as unknown as FormData
    ;(mockFileService.createFormDataWithFile as sinon.SinonStub).returns(mockFormData)

    scanCardStub = sinon.stub(IrisApiClient.prototype, 'scanCard')

    mapperStub = sinon.stub(IrisMapper, 'scanAnalyseIrisResponseToScanCardInfoDTO')
  })

  group.each.teardown(async () => {
    sinon.restore()
  })

  test('getAnalyseResults - should return analysis results successfully', async ({ assert }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'

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
          extracted_temp_image_url: 'https://example.com/temp-image.jpg',
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
        extractedTempImageUrl: 'https://example.com/temp-image.jpg',
      },
    ]

    scanCardStub.resolves(mockScanResponse)
    mapperStub.withArgs(mockScanResponse).returns(expectedResult)

    const scanService = new ScanService(mockFileService)
    const result = await scanService.getAnalyseResults(filePath, fileName, fileType)

    assert.deepEqual(result, expectedResult)

    sinon.assert.calledWith(
      mockFileService.createFormDataWithFile as sinon.SinonStub,
      filePath,
      fileName,
      fileType
    )

    sinon.assert.calledWith(scanCardStub, mockFormData)

    sinon.assert.calledWith(mapperStub, mockScanResponse)
  })

  test('getAnalyseResults - should use the default type if fileType is not provided', async ({
    assert,
  }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'

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
          extracted_temp_image_url: 'https://example.com/temp-image.jpg',
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
        extractedTempImageUrl: 'https://example.com/temp-image.jpg',
      },
    ]

    scanCardStub.resolves(mockScanResponse)
    mapperStub.returns(expectedResult)

    const scanService = new ScanService(mockFileService)
    const result = await scanService.getAnalyseResults(filePath, fileName, undefined)

    assert.deepEqual(result, expectedResult)

    sinon.assert.calledWith(
      mockFileService.createFormDataWithFile as sinon.SinonStub,
      filePath,
      fileName,
      undefined
    )
  })

  test('analyze - should always delete the file, even in case of error', async ({
    client,
    assert,
  }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'
    const errorMessage = 'Iris service unavailable'

    scanCardStub.rejects(new IrisException(errorMessage))

    const scanService = new ScanService(mockFileService)

    await assert.rejects(async () => {
      await scanService.getAnalyseResults(filePath, fileName, fileType)
    }, 'Iris service unavailable')
  })
})
