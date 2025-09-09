import { test } from '@japa/runner'
import sinon from 'sinon'
import fs from 'node:fs/promises'
import FileService from '#services/file_service'

test.group('FileService', (group) => {
  let sandbox: sinon.SinonSandbox
  let fileService: FileService
  let readFileStub: sinon.SinonStub
  let unlinkStub: sinon.SinonStub

  group.each.setup(() => {
    sandbox = sinon.createSandbox()

    // Mock of fs methods
    readFileStub = sandbox.stub(fs, 'readFile')
    unlinkStub = sandbox.stub(fs, 'unlink').resolves()

    fileService = new FileService()
  })

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('readFileToBuffer - should read file to buffer', async ({ assert }) => {
    const mockFile = {
      isValid: true,
      tmpPath: '/tmp/test-file.jpg',
    }

    const expectedBuffer = Buffer.from('test file content')
    readFileStub.withArgs(mockFile.tmpPath).resolves(expectedBuffer)

    const result = await fileService.readFileToBuffer(mockFile as any)

    assert.deepEqual(result, expectedBuffer)
    sinon.assert.calledOnce(readFileStub)
    sinon.assert.calledWith(readFileStub, mockFile.tmpPath)
  })

  test('readFileToBuffer - should return null for invalid files', async ({ assert }) => {
    const invalidFile = {
      isValid: false,
      tmpPath: '/tmp/invalid-file.jpg',
    }

    let result = await fileService.readFileToBuffer(invalidFile as any)
    assert.isNull(result)

    const noPathFile = {
      isValid: true,
      tmpPath: undefined,
    }

    result = await fileService.readFileToBuffer(noPathFile as any)
    assert.isNull(result)
  })

  test('cleanupTempFile - should delete temporary file', async () => {
    const mockFile = {
      tmpPath: '/tmp/test-file.jpg',
    }

    await fileService.cleanupTempFile(mockFile as any)

    sinon.assert.calledOnce(unlinkStub)
    sinon.assert.calledWith(unlinkStub, mockFile.tmpPath)
  })
})
