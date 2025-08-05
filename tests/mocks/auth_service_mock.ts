import sinon from 'sinon'
import WardenApiClient from '#clients/warden_api_client'
import { AuthUser } from '#types/auth_user_type'

export const TEST_AUTH_USER_ID = '123'
export const TEST_AUTH_USER_USERNAME = 'Test'

export default class AuthServiceMock {
  /**
   * Configure client stub for WardenApiClient
   * @returns
   */
  static setupWardenApiClientStub(): sinon.SinonStub {
    const wardenApiClientStub = sinon.stub(WardenApiClient.prototype, 'getMe')

    const mockUser: AuthUser = {
      id: TEST_AUTH_USER_ID,
      email: 'test@example.com',
      username: TEST_AUTH_USER_USERNAME,
    }

    wardenApiClientStub.resolves(mockUser)

    return wardenApiClientStub
  }
}
