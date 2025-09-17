// import { test } from '@japa/runner'
// import sinon from 'sinon'
// import MediaUploadService from '#services/media_upload_service'
// import CloudinaryApiClient from '#clients/cloudinary_api_client'

// test.group('MediaUploadService', (group) => {
//   group.each.teardown(() => {
//     sinon.restore()
//   })

//   test('upload - should call CloudinaryApiClient.uploadFile and return url', async ({ assert }) => {
//     const uploadStub = sinon
//       .stub(CloudinaryApiClient.prototype, 'uploadFile')
//       .resolves({ url: 'https://res.cloudinary.com/demo/image.png' } as any)

//     const client = new CloudinaryApiClient()
//     const service = new MediaUploadService(client)

//     const result = await service.upload('/tmp/file.png', 'ads/recto')

//     assert.equal(result, 'https://res.cloudinary.com/demo/image.png')
//     sinon.assert.calledOnce(uploadStub)
//     sinon.assert.calledWith(uploadStub, '/tmp/file.png', 'ads/recto')
//   })

//   test('upload - should propagate error when Cloudinary client fails', async ({ assert }) => {
//     sinon.stub(CloudinaryApiClient.prototype, 'uploadFile').rejects(new Error('cloudinary down'))

//     const client = new CloudinaryApiClient()
//     const service = new MediaUploadService(client)

//     await assert.rejects(async () => {
//       await service.upload('/tmp/file.png', 'ads/recto')
//     }, /cloudinary down/)
//   })
// })
