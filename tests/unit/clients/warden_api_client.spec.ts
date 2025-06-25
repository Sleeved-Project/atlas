import { test } from '@japa/runner'
import sinon from 'sinon'
import WardenApiClient from '#clients/warden_api_client'
import AuthException from '#exceptions/auth_exception'
import { WardenException } from '#exceptions/warden_exception'
import { AuthUser } from '#types/auth_user_type'

test.group('WardenApiClient', (group) => {
  let wardenApiClient: WardenApiClient
  let fetchStub: sinon.SinonStub
  const mockToken = 'fake-token-for-testing'

  group.each.setup(() => {
    wardenApiClient = new WardenApiClient()
    fetchStub = sinon.stub(global, 'fetch')
  })

  group.each.teardown(() => {
    fetchStub.restore()
  })

  test('getMe - it should return user data when request is successful', async ({ assert }) => {
    const mockUserResponse: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      fullname: 'Test User',
    }

    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves(mockUserResponse),
    })

    const result = await wardenApiClient.getMe(mockToken)

    assert.deepEqual(result, mockUserResponse)
  })

  test('getMe - should throw AuthException when response is not ok', async ({ assert }) => {
    fetchStub.resolves({
      ok: false,
      status: 401,
    })

    await assert.rejects(async () => {
      await wardenApiClient.getMe(mockToken)
    }, AuthException.message)
  })

  test('getMe - should throw AuthException and propagate it correctly', async ({ assert }) => {
    fetchStub.resolves({
      ok: false,
      status: 403,
    })

    try {
      await wardenApiClient.getMe(mockToken)
      assert.fail('Expected to throw AuthException')
    } catch (error) {
      assert.instanceOf(error, AuthException)
    }
  })

  test('getMe - should throw WardenException for fetch errors', async ({ assert }) => {
    fetchStub.rejects(new Error())

    await assert.rejects(async () => {
      await wardenApiClient.getMe(mockToken)
    }, WardenException.message)
  })

  test('getMe - should throw WardenException for JSON parsing errors', async ({ assert }) => {
    fetchStub.resolves({
      ok: true,
      json: sinon.stub().rejects(new Error()),
    })

    await assert.rejects(async () => {
      await wardenApiClient.getMe(mockToken)
    }, WardenException.message)
  })

  test('getMe - should throw WardenException for non-AuthException errors', async ({ assert }) => {
    fetchStub.callsFake(() => {
      throw new Error()
    })

    await assert.rejects(async () => {
      await wardenApiClient.getMe(mockToken)
    }, WardenException.message)
  })
})
