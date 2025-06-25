import sinon from 'sinon'
import WardenApiClient from '#clients/warden_api_client'
import { AuthUser } from '#types/auth_user_type'

export default class AuthServiceMock {
  /**
   * Configure client stub for WardenApiClient
   * @returns
   */
  static setupWardenApiClientStub(): sinon.SinonStub {
    const wardenApiClientStub = sinon.stub(WardenApiClient.prototype, 'getMe')

    const mockUser: AuthUser = {
      id: '123',
      email: 'test@example.com',
      fullname: 'Test',
    }

    wardenApiClientStub.resolves(mockUser)

    return wardenApiClientStub
  }
}
