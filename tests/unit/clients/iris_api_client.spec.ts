import { test } from '@japa/runner'
import sinon from 'sinon'
import IrisApiClient from '#clients/iris_api_client'

test.group('IrisApiClient', (group) => {
  let irisApiClient: IrisApiClient
  let mockFormData: FormData
  let fetchStub: sinon.SinonStub

  group.each.setup(() => {
    irisApiClient = new IrisApiClient()

    mockFormData = new FormData()
    mockFormData.append('image', 'test-image-data')

    fetchStub = sinon.stub(global, 'fetch')
  })

  group.each.teardown(() => {
    // Restoring the original fetch function
    fetchStub.restore()
  })

  test('scanCard - it should return response data when request is successful', async ({
    assert,
  }) => {
    const mockResponse = {
      cards: [{ id: '1', name: 'Test Card', set: 'Test Set', confidence: 0.95 }],
    }

    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves(mockResponse),
    })

    const result = await irisApiClient.scanCard(mockFormData)

    assert.deepEqual(result, mockResponse)
    sinon.assert.calledOnce(fetchStub)
    sinon.assert.calledWith(fetchStub, 'http://iris-api:8083/api/v1/images/analyze', {
      method: 'POST',
      body: mockFormData,
    })
  })

  test('scanCard - should throw IrisConnectionException when response is not ok', async ({
    assert,
  }) => {
    fetchStub.resolves({
      ok: false,
    })

    await assert.rejects(async () => {
      await irisApiClient.scanCard(mockFormData)
    }, 'Iris service unavailable')
  })

  test('scanCard - should throw IrisNoMatchException when no card is found', async ({ assert }) => {
    const mockResponse = { cards: [] }

    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves(mockResponse),
    })

    await assert.rejects(async () => {
      await irisApiClient.scanCard(mockFormData)
    }, 'No matching cards found for the scan')
  })

  test('scanCard - should throw IrisNoMatchException when cards is null', async ({ assert }) => {
    const mockResponse = { cards: null }

    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves(mockResponse),
    })

    await assert.rejects(async () => {
      await irisApiClient.scanCard(mockFormData)
    }, 'No matching cards found for the scan')
  })

  test('scanCard - should throw IrisException for non-specific errors', async ({ assert }) => {
    fetchStub.rejects(new Error('Network error'))

    await assert.rejects(async () => {
      await irisApiClient.scanCard(mockFormData)
    }, 'Unknown error occured with iris')
  })
})
