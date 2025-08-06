import { TEST_AUTH_USER_ID, TEST_AUTH_USER_USERNAME } from '#tests/mocks/auth_service_mock'
import { UserFactory } from '#database/factories/user'

/**
 * Ensures that the test user exists in the database
 */
export async function createTestUser() {
  await UserFactory.merge({
    id: TEST_AUTH_USER_ID,
    username: TEST_AUTH_USER_USERNAME,
  }).create()

  return TEST_AUTH_USER_ID
}
