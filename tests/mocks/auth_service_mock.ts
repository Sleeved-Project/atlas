import sinon from 'sinon'
import WardenApiClient from '#clients/warden_api_client'
import { AuthUser } from '#types/auth_user_type'

export const TEST_AUTH_USER_ID = 'user-123-id'
export const TEST_AUTH_USER_USERNAME = 'Test username'
export const TEST_AUTH_USER_EMAIL = 'test@example.com'
export const TEST_AUTH_USER_STRIPE_ID = 'stripe_test_id'
export const TEST_AUTH_USER_CUSTOMER_ID = 'Test customer_test_id'

export default class AuthServiceMock {
  /**
   * Configure client stub for WardenApiClient
   * @returns
   */
  static setupWardenApiClientStub(): sinon.SinonStub {
    const wardenApiClientStub = sinon.stub(WardenApiClient.prototype, 'getMe')

    const mockUser: AuthUser = {
      id: TEST_AUTH_USER_ID,
      email: TEST_AUTH_USER_EMAIL,
      username: TEST_AUTH_USER_USERNAME,
    }

    wardenApiClientStub.resolves(mockUser)

    return wardenApiClientStub
  }
}
