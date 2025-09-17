import {
  TEST_AUTH_USER_CUSTOMER_ID,
  TEST_AUTH_USER_ID,
  TEST_AUTH_USER_STRIPE_ID,
  TEST_AUTH_USER_USERNAME,
} from '#tests/mocks/auth_service_mock'
import { UserFactory } from '#database/factories/user'

/**
 * Ensures that the test user exists in the database
 */
export async function createTestUser() {
  await UserFactory.merge({
    id: TEST_AUTH_USER_ID,
    username: TEST_AUTH_USER_USERNAME,
    stripeId: TEST_AUTH_USER_STRIPE_ID,
    customerId: TEST_AUTH_USER_CUSTOMER_ID,
  }).create()

  return TEST_AUTH_USER_ID
}
