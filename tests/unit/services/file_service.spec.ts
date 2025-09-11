import { test } from '@japa/runner'
import sinon from 'sinon'
import FileService from '#services/file_service'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { FileUploadException } from '#exceptions/file_upload_exception'
import fs from 'node:fs'
import app from '@adonisjs/core/services/app'

test.group('File service', (group) => {
  let fileService: FileService
  let moveFileStub: sinon.SinonStub
  let fsExistsStub: sinon.SinonStub
  let fsRmStub: sinon.SinonStub
  let mockFile: Partial<MultipartFile>

  group.each.setup(() => {
    fileService = new FileService()

    moveFileStub = sinon.stub()
    fsExistsStub = sinon.stub(fs, 'existsSync')
    fsRmStub = sinon.stub(fs, 'rmSync')

    mockFile = {
      extname: 'png',
      move: moveFileStub,
      filePath: `${app.makePath('storage/uploads')}/test-file.png`,
    }
  })

  group.each.teardown(() => {
    sinon.restore()
  })

  test('saveFile - should save file successfully', async ({ assert }) => {
    moveFileStub.resolves()

    const filePath = await fileService.saveFile(mockFile as MultipartFile)

    assert.equal(filePath, mockFile.filePath)
    assert.isTrue(moveFileStub.calledOnce)
    assert.match(moveFileStub.firstCall.args[1].name, /^[a-z0-9]+\.png$/)
  })

  test('saveFile - should throw FileUploadException when file move fails', async ({ assert }) => {
    const mockFileWithoutPath = { ...mockFile, filePath: undefined }
    moveFileStub.resolves()

    try {
      await fileService.saveFile(mockFileWithoutPath as MultipartFile)
      assert.fail('Expected saveFile to throw FileUploadException')
    } catch (error) {
      assert.instanceOf(error, FileUploadException)
      assert.isTrue(moveFileStub.calledOnce)
    }
  })

  test('cleanup - should remove all registered files', async ({ assert }) => {
    fsExistsStub.returns(true)

    // Enregistrer quelques fichiers
    await fileService.saveFile(mockFile as MultipartFile)
    await fileService.saveFile({
      ...mockFile,
      filePath: '/path/to/another/file.png',
    } as MultipartFile)

    fileService.cleanup()

    assert.isTrue(fsExistsStub.calledTwice)
    assert.isTrue(fsRmStub.calledTwice)
  })

  test('cleanup - should skip non-existent files', async ({ assert }) => {
    fsExistsStub.returns(false)

    await fileService.saveFile(mockFile as MultipartFile)
    fileService.cleanup()

    assert.isTrue(fsExistsStub.calledOnce)
    assert.isTrue(fsRmStub.notCalled)
  })

  test('cleanup - should clear filesToClean after cleanup', async ({ assert }) => {
    fsExistsStub.returns(true)

    await fileService.saveFile(mockFile as MultipartFile)
    fileService.cleanup()

    // Deuxième cleanup ne devrait rien faire
    fileService.cleanup()

    assert.isTrue(fsExistsStub.calledOnce)
    assert.isTrue(fsRmStub.calledOnce)
  })
})
