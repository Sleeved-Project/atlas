import { test } from '@japa/runner'
import sinon from 'sinon'
import fs from 'node:fs'
import cloudinary from 'cloudinary'
import CloudinaryApiClient from '#clients/cloudinary_api_client'

test.group('CloudinaryApiClient', (group) => {
  let client: CloudinaryApiClient
  let uploadStub: sinon.SinonStub
  let destroyStub: sinon.SinonStub
  let existsSyncStub: sinon.SinonStub

  group.each.setup(() => {
    client = new CloudinaryApiClient()
    uploadStub = sinon.stub()
    destroyStub = sinon.stub()
    existsSyncStub = sinon.stub(fs, 'existsSync')

    // Stub cloudinary uploader
    sinon.stub(cloudinary, 'v2').value({
      uploader: {
        upload: uploadStub,
        destroy: destroyStub,
      },
      config: sinon.stub(),
    })
  })

  group.each.teardown(() => {
    sinon.restore()
  })

  test('uploadFile - should upload file and return info', async ({ assert }) => {
    const filePath = '/tmp/test-file.png'
    existsSyncStub.withArgs(filePath).returns(true)

    const mockResult = {
      public_id: 'uploads/ads/recto/abcd',
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/uploads/ads/recto/abcd.png',
      width: 400,
      height: 300,
      format: 'png',
      resource_type: 'image',
    }

    uploadStub.resolves(mockResult)

    const result = await client.uploadFile(filePath, 'ads/recto')

    assert.equal(result.publicId, mockResult.public_id)
    assert.equal(result.url, mockResult.secure_url)
    assert.equal(result.width, mockResult.width)
    assert.equal(result.height, mockResult.height)
    assert.equal(result.format, mockResult.format)
    assert.equal(result.resourceType, mockResult.resource_type)

    sinon.assert.calledOnce(uploadStub)
    sinon.assert.calledWith(uploadStub, filePath, { folder: 'ads/recto', resource_type: 'auto' })
  })

  test('uploadFile - should throw CloudinaryError when file does not exist', async ({ assert }) => {
    const filePath = '/not/existing.png'
    existsSyncStub.withArgs(filePath).returns(false)

    await assert.rejects(async () => {
      await client.uploadFile(filePath, 'ads/recto')
    }, /File not found at path/)
  })

  test('uploadFile - should throw CloudinaryError when cloudinary upload fails', async ({
    assert,
  }) => {
    const filePath = '/tmp/test-file.png'
    existsSyncStub.withArgs(filePath).returns(true)

    uploadStub.rejects(new Error('Cloudinary down'))

    await assert.rejects(async () => {
      await client.uploadFile(filePath, 'ads/recto')
    }, /Failed to upload file to Cloudinary/)

    sinon.assert.calledOnce(uploadStub)
  })

  test('deleteFile - should call destroy on cloudinary', async () => {
    const publicId = 'uploads/ads/recto/abcd'
    destroyStub.resolves({ result: 'ok' })

    await client.deleteFile(publicId)

    sinon.assert.calledOnce(destroyStub)
    sinon.assert.calledWith(destroyStub, publicId)
  })

  test('deleteFile - should throw CloudinaryError when destroy fails', async ({ assert }) => {
    const publicId = 'uploads/ads/recto/abcd'
    destroyStub.rejects(new Error('Destroy failed'))

    await assert.rejects(async () => {
      await client.deleteFile(publicId)
    }, /Failed to delete file from Cloudinary/)

    sinon.assert.calledOnce(destroyStub)
  })
})
