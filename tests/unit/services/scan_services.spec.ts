import { test } from '@japa/runner'
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

  test('analyze - should always delete the file, even in case of error', async ({ assert }) => {
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

  test('getGradingResults - should return grading results successfully', async ({ assert }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'

    const mockGradeResponse = {
      message: 'Gradation complétée. Score: 8',
      cards: [
        {
          average_card_score: 8,
          surface_score: 7.6,
          contour_score: 8.2,
          corner_score: 8.1,
          center_score: 8.1,
          top_class_matchs: [],
        },
      ],
    }

    const expectedGradeResult = {
      globalRating: 8,
      surfaceRating: 7.6,
      edgeRating: 8.2,
      cornerRating: 8.1,
      centerRating: 8.1,
    }

    const gradeCardStub = sinon.stub(IrisApiClient.prototype, 'gradeCard')
    const gradeMapperStub = sinon.stub(IrisMapper, 'scanGradeIrisResponseToGradeInputDTO')

    gradeCardStub.resolves(mockGradeResponse)
    gradeMapperStub.withArgs(mockGradeResponse).returns(expectedGradeResult)

    const scanService = new ScanService(mockFileService)
    const result = await scanService.getGradingResults(filePath, fileName, fileType)

    assert.deepEqual(result, expectedGradeResult)
    sinon.assert.calledWith(
      mockFileService.createFormDataWithFile as sinon.SinonStub,
      filePath,
      fileName,
      fileType
    )
    sinon.assert.calledWith(gradeCardStub, mockFormData)
    sinon.assert.calledWith(gradeMapperStub, mockGradeResponse)
  })

  test('getGradingResults - should handle iris service errors', async ({ assert }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'
    const errorMessage = 'Service de gradation indisponible'

    const gradeCardStub = sinon.stub(IrisApiClient.prototype, 'gradeCard')
    gradeCardStub.rejects(new IrisException(errorMessage))

    const scanService = new ScanService(mockFileService)

    await assert.rejects(
      async () => await scanService.getGradingResults(filePath, fileName, fileType),
      errorMessage
    )
  })
})
