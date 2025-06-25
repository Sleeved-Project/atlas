import { test } from '@japa/runner'
import AuthService from '#services/auth_service'
import WardenApiClient from '#clients/warden_api_client'
import { AuthUser } from '#types/auth_user_type'
import sinon from 'sinon'
import AuthException from '#exceptions/auth_exception'
import { WardenException } from '#exceptions/warden_exception'

test.group('AuthService', (group) => {
  let authService: AuthService
  let wardenApiClientStub: sinon.SinonStub
  let wardenApiClient: WardenApiClient
  const mockToken = 'fake-token-for-testing'
  const mockUser: AuthUser = {
    id: 'user-123',
    email: 'test@example.com',
    fullname: 'Test User',
  }

  group.each.setup(() => {
    wardenApiClient = new WardenApiClient()
    wardenApiClientStub = sinon.stub(wardenApiClient, 'getMe')

    authService = new AuthService(wardenApiClient)
  })

  group.each.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('getMe - should return user data when authentication is successful', async ({ assert }) => {
    wardenApiClientStub.resolves(mockUser)

    const result = await authService.getMe(mockToken)

    assert.deepEqual(result, mockUser)
    sinon.assert.calledOnce(wardenApiClientStub)
    sinon.assert.calledWith(wardenApiClientStub, mockToken)
  })

  test('getMe - should propagate AuthException when authentication fails', async ({ assert }) => {
    const authException = new AuthException()
    wardenApiClientStub.rejects(authException)

    await assert.rejects(async () => {
      await authService.getMe(mockToken)
    }, AuthException.message)

    sinon.assert.calledOnce(wardenApiClientStub)
    sinon.assert.calledWith(wardenApiClientStub, mockToken)
  })

  test('getMe - should propagate WardenException when service is unavailable', async ({
    assert,
  }) => {
    const wardenException = new WardenException()
    wardenApiClientStub.rejects(wardenException)

    await assert.rejects(async () => {
      await authService.getMe(mockToken)
    }, WardenException.message)

    sinon.assert.calledOnce(wardenApiClientStub)
  })

  test('getMe - should propagate any error thrown by the client', async ({ assert }) => {
    const genericError = new Error('Unexpected error')
    wardenApiClientStub.rejects(genericError)

    await assert.rejects(async () => {
      await authService.getMe(mockToken)
    }, Error)

    sinon.assert.calledOnce(wardenApiClientStub)
  })

  test('getMe - should return user object with correct structure', async ({ assert }) => {
    const detailedMockUser: AuthUser = {
      id: 'user-456',
      email: 'detailed@example.com',
      fullname: 'Detailed User',
    }
    wardenApiClientStub.resolves(detailedMockUser)

    const result = await authService.getMe(mockToken)

    assert.equal(result.id, detailedMockUser.id)
    assert.equal(result.email, detailedMockUser.email)
    assert.equal(result.fullname, detailedMockUser.fullname)
  })
})
