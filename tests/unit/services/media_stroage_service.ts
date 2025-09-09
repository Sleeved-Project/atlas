import { test } from '@japa/runner'
import sinon from 'sinon'
import { v2 as cloudinary } from 'cloudinary'
import MediaStorageService from '#services/media_storage_service'

test.group('MediaStorageService', (group) => {
  let sandbox: sinon.SinonSandbox
  let uploadStub: sinon.SinonStub
  let destroyStub: sinon.SinonStub
  let mediaStorageService: MediaStorageService

  // Simulated Cloudinary configuration for tests
  const mockCloudinaryConfig = {
    cloud_name: 'test-cloud',
    api_key: 'test-api-key',
    api_secret: 'test-secret',
    secure: true,
  }

  group.each.setup(() => {
    sandbox = sinon.createSandbox()

    // Simulate Cloudinary configuration
    sandbox.stub(cloudinary, 'config').returns(mockCloudinaryConfig)

    // Simulate Cloudinary upload and delete methods
    uploadStub = sandbox.stub()
    destroyStub = sandbox.stub()

    sandbox.stub(cloudinary, 'uploader').value({
      upload: uploadStub,
      destroy: destroyStub,
    })

    mediaStorageService = new MediaStorageService()
  })

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('uploadBuffer - should upload buffer to Cloudinary and return result', async ({
    assert,
  }) => {
    const testBuffer = Buffer.from('test image data')
    const uploadOptions = {
      folder: 'users/123/profile',
      fileName: 'profile_picture',
    }

    const expectedResult = {
      secure_url:
        'https://res.cloudinary.com/test-cloud/image/upload/v1/users/123/profile/profile_picture.jpg',
      public_id: 'users/123/profile/profile_picture',
    }

    uploadStub.resolves(expectedResult)

    const result = await mediaStorageService.uploadBuffer(testBuffer, uploadOptions)

    assert.equal(result.url, expectedResult.secure_url)
    assert.equal(result.publicId, expectedResult.public_id)

    sinon.assert.calledOnce(uploadStub)
    const uploadCall = uploadStub.firstCall
    assert.isTrue(uploadCall.args[0].startsWith('data:image/jpeg;base64,'))
    assert.deepEqual(uploadCall.args[1], {
      resource_type: 'auto',
      unique_filename: true,
      folder: 'users/123/profile',
      public_id: 'profile_picture',
    })
  })

  test('deleteImage - should delete image from Cloudinary', async ({ assert }) => {
    const publicId = 'users/123/profile/old_picture'
    destroyStub.resolves({ result: 'ok' })

    const result = await mediaStorageService.deleteImage(publicId)

    assert.isTrue(result)
    sinon.assert.calledOnce(destroyStub)
    sinon.assert.calledWith(destroyStub, publicId)
  })

  test('getPublicIdFromUrl - should extract public ID from Cloudinary URL', ({ assert }) => {
    const url =
      'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/users/123/profile/picture.jpg'

    const publicId = mediaStorageService.getPublicIdFromUrl(url)

    assert.equal(publicId, 'users/123/profile/picture.jpg')
  })

  test('getPublicIdFromUrl - should return null for invalid URLs', ({ assert }) => {
    assert.isNull(mediaStorageService.getPublicIdFromUrl(''))
    assert.isNull(mediaStorageService.getPublicIdFromUrl('https://example.com/image.jpg'))
  })
})
