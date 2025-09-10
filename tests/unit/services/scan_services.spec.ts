import { test } from '@japa/runner'
import sinon from 'sinon'
import fs from 'node:fs'
import ScanService from '#services/scan_service'
import IrisApiClient from '#clients/iris_api_client'
import IrisMapper from '#mappers/iris_mapper'
import { ScanAnalyseIrisResponse, ScanCardInfoDTO, GradingIrisResponse } from '#types/iris_type'
import { IrisException } from '#exceptions/iris_exception'

test.group('ScanService', (group) => {
  let readFileSyncStub: sinon.SinonStub
  let scanCardStub: sinon.SinonStub
  let gradeCardStub: sinon.SinonStub
  let mapperStub: sinon.SinonStub
  let fileConstructorStub: sinon.SinonStub
  let formDataAppendStub: sinon.SinonStub
  let originalFormData: typeof FormData

  group.each.setup(() => {
    originalFormData = global.FormData

    readFileSyncStub = sinon.stub(fs, 'readFileSync')

    // Correction du stub File pour prendre 3 arguments
    fileConstructorStub = sinon.stub(global, 'File').callsFake(function (
      name: string,
      options?: { type?: string }
    ) {
      return { name, type: options?.type || 'application/octet-stream' }
    })

    formDataAppendStub = sinon.stub()
    // @ts-ignore
    global.FormData = function () {
      return { append: formDataAppendStub }
    }

    scanCardStub = sinon.stub(IrisApiClient.prototype, 'scanCard')
    gradeCardStub = sinon.stub(IrisApiClient.prototype, 'gradeCard')
    mapperStub = sinon.stub(IrisMapper, 'scanAnalyseIrisResponseToScanCardInfoDTO')
  })

  group.each.teardown(() => {
    sinon.restore()
    global.FormData = originalFormData
  })

  // -------------------- Analyse tests --------------------
  test('getAnalyseResults - should return analysis results successfully', async ({ assert }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'
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

    const expectedResult: ScanCardInfoDTO[] = [{ id: '123', similarity: 95 }]

    readFileSyncStub.withArgs(filePath).returns(fileBuffer)
    scanCardStub.resolves(mockScanResponse)
    mapperStub.withArgs(mockScanResponse).returns(expectedResult)

    const scanService = new ScanService()
    const result = await scanService.getAnalyseResults(filePath, fileName, fileType)

    assert.deepEqual(result, expectedResult)
    sinon.assert.calledWith(readFileSyncStub, filePath)
    sinon.assert.calledWith(fileConstructorStub, [fileBuffer], fileName, { type: fileType })
    sinon.assert.called(formDataAppendStub)
    sinon.assert.called(scanCardStub)
    sinon.assert.calledWith(mapperStub, mockScanResponse)
  })

  test('getAnalyseResults - should use default type if fileType not provided', async ({
    assert,
  }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileBuffer = Buffer.from('fake-image-data')
    const mockScanResponse: ScanAnalyseIrisResponse = { message: 'Success', cards: [] }

    readFileSyncStub.withArgs(filePath).returns(fileBuffer)
    scanCardStub.resolves(mockScanResponse)
    mapperStub.returns([])

    const scanService = new ScanService()
    const result = await scanService.getAnalyseResults(filePath, fileName, undefined)

    assert.deepEqual(result, [])
    sinon.assert.calledWith(fileConstructorStub, [fileBuffer], fileName, {
      type: 'application/octet-stream',
    })
  })

  test('getAnalyseResults - should propagate exception from Iris', async ({ assert }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'
    const errorMessage = 'Iris service unavailable'

    readFileSyncStub.returns(Buffer.from('fake-image-data'))
    scanCardStub.rejects(new IrisException(errorMessage))

    const scanService = new ScanService()
    await assert.rejects(async () => {
      await scanService.getAnalyseResults(filePath, fileName, fileType)
    }, 'Iris service unavailable')
  })

  // -------------------- Grading tests --------------------
  test('getGradingResults - should return grading results successfully', async ({ assert }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'
    const fileBuffer = Buffer.from('fake-image-data')

    const mockGradingResponse: GradingIrisResponse = {
      message: 'Gradation complétée. Score: 9',
      cards: [
        {
          average_card_score: 9,
          top_class_matchs: [
            { card_class: 'PSA_9', confidence: 64.25 },
            { card_class: 'PSA_10', confidence: 27.69 },
          ],
          surface_score: 8.7,
          contour_score: 8.6,
          corner_score: 8.8,
          center_score: 9.9,
        },
      ],
    }

    readFileSyncStub.withArgs(filePath).returns(fileBuffer)
    gradeCardStub.resolves(mockGradingResponse)

    const scanService = new ScanService()
    const result = await scanService.getGradingResults(filePath, fileName, fileType)

    assert.deepEqual(result, mockGradingResponse)
    sinon.assert.calledWith(readFileSyncStub, filePath)
    sinon.assert.calledWith(fileConstructorStub, [fileBuffer], fileName, { type: fileType })
    sinon.assert.called(formDataAppendStub)
    sinon.assert.called(gradeCardStub)
  })

  test('getGradingResults - should propagate exception from Iris', async ({ assert }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileType = 'image/jpeg'
    const errorMessage = 'Iris service unavailable'

    readFileSyncStub.returns(Buffer.from('fake-image-data'))
    gradeCardStub.rejects(new IrisException(errorMessage))

    const scanService = new ScanService()
    await assert.rejects(async () => {
      await scanService.getGradingResults(filePath, fileName, fileType)
    }, 'Iris service unavailable')
  })

  test('getGradingResults - should use default type if fileType not provided', async ({
    assert,
  }) => {
    const filePath = '/path/to/image.jpg'
    const fileName = 'image.jpg'
    const fileBuffer = Buffer.from('fake-image-data')

    readFileSyncStub.withArgs(filePath).returns(fileBuffer)
    gradeCardStub.resolves({ message: 'Gradation complétée', cards: [] })

    const scanService = new ScanService()
    const result = await scanService.getGradingResults(filePath, fileName, undefined)

    assert.deepEqual(result, { message: 'Gradation complétée', cards: [] })
    sinon.assert.calledWith(fileConstructorStub, [fileBuffer], fileName, {
      type: 'application/octet-stream',
    })
  })
})
