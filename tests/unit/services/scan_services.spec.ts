import { test } from '@japa/runner'
import sinon from 'sinon'
import fs from 'node:fs'
import ScanService from '#services/scan_service'
import IrisApiClient from '#clients/iris_api_client'
import IrisMapper from '#mappers/iris_mapper'
import { ScanAnalyseIrisResponse, ScanCardInfoDTO } from '#types/iris_type'
import { IrisException } from '#exceptions/iris_exception'

test.group('ScanService', (group) => {
  let readFileSyncStub: sinon.SinonStub
  let scanCardStub: sinon.SinonStub
  let mapperStub: sinon.SinonStub
  let fileConstructorStub: sinon.SinonStub
  let formDataAppendStub: sinon.SinonStub

  let originalFormData: typeof FormData

  group.each.setup(() => {
    originalFormData = global.FormData

    readFileSyncStub = sinon.stub(fs, 'readFileSync')

    fileConstructorStub = sinon.stub(global, 'File').callsFake(function (args) {
      return { name: args[1], type: args[2]?.type || 'application/octet-stream' }
    })

    formDataAppendStub = sinon.stub()
    // @ts-ignore - Ignores TypeScript error for global FormData
    global.FormData = function () {
      return {
        append: formDataAppendStub,
      }
    }

    scanCardStub = sinon.stub(IrisApiClient.prototype, 'scanCard')

    mapperStub = sinon.stub(IrisMapper, 'scanAnalyseIrisResponseToScanCardInfoDTO')
  })

  group.each.teardown(() => {
    sinon.restore()

    global.FormData = originalFormData
  })

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

    const expectedResult: ScanCardInfoDTO[] = [
      {
        id: '123',
        similarity: 95,
      },
    ]

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

  test('getAnalyseResults - should use the default type if fileType is not provided', async ({
    assert,
  }) => {
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

    readFileSyncStub.withArgs(filePath).returns(fileBuffer)
    scanCardStub.resolves(mockScanResponse)
    mapperStub.returns(expectedResult)

    const scanService = new ScanService()
    const result = await scanService.getAnalyseResults(filePath, fileName, undefined)

    assert.deepEqual(result, expectedResult)
    sinon.assert.calledWith(fileConstructorStub, [fileBuffer], fileName, {
      type: 'application/octet-stream',
    })
  })

  test('getAnalyseResults - should propagate the exception thrown by irisApiClient', async ({
    assert,
  }) => {
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
})
