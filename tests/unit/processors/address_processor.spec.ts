// import { test } from '@japa/runner'
// import testUtils from '@adonisjs/core/services/test_utils'
// import UserAddressService from '#services/user_address_service'
// import { UserFactory } from '#database/factories/user'

// import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
// import { AddressFactory } from '#database/factories/address'
// import { UserAddressFactory } from '#database/factories/user_address'

// test.group('UserAddressService', (group) => {
//   let userAddressService: UserAddressService

//   group.setup(() => {
//     userAddressService = new UserAddressService()
//   })

//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   test('hasMainAddress - should return true when user has a main address', async ({ assert }) => {
//     await UserFactory.merge({ id: TEST_AUTH_USER_ID }).create()
//     const address = await AddressFactory.create()
//     await UserAddressFactory.merge({
//       userId: TEST_AUTH_USER_ID,
//       addressId: address.id,
//       isMain: true,
//     }).create()

//     const result = await userAddressService.hasMainAddress(TEST_AUTH_USER_ID)
//     assert.isTrue(result)
//   })

//   test('hasMainAddress - should return false when user has no main address', async ({ assert }) => {
//     await UserFactory.merge({ id: TEST_AUTH_USER_ID }).create()
//     const address = await AddressFactory.create()
//     await UserAddressFactory.merge({
//       userId: TEST_AUTH_USER_ID,
//       addressId: address.id,
//       isMain: false,
//     }).create()

//     const result = await userAddressService.hasMainAddress(TEST_AUTH_USER_ID)
//     assert.isFalse(result)
//   })

//   test('hasMainAddress - should return false when user has no addresses', async ({ assert }) => {
//     await UserFactory.merge({ id: TEST_AUTH_USER_ID }).create()

//     const result = await userAddressService.hasMainAddress(TEST_AUTH_USER_ID)
//     assert.isFalse(result)
//   })

//   test('createUserAddress - should create user address with main address', async ({ assert }) => {
//     await UserFactory.merge({ id: TEST_AUTH_USER_ID }).create()
//     const address = await AddressFactory.create()

//     const userAddress = await userAddressService.createUserAddress(
//       TEST_AUTH_USER_ID,
//       address.id,
//       true
//     )

//     assert.equal(userAddress.userId, TEST_AUTH_USER_ID)
//     assert.equal(userAddress.addressId, address.id)
//     assert.isTrue(userAddress.isMain)
//   })

//   test('createUserAddress - should create user address without main address', async ({
//     assert,
//   }) => {
//     await UserFactory.merge({ id: TEST_AUTH_USER_ID }).create()
//     const address = await AddressFactory.create()

//     const userAddress = await userAddressService.createUserAddress(
//       TEST_AUTH_USER_ID,
//       address.id,
//       false
//     )

//     assert.equal(userAddress.userId, TEST_AUTH_USER_ID)
//     assert.equal(userAddress.addressId, address.id)
//     assert.isFalse(userAddress.isMain)
//   })

//   test('createUserAddress - should throw error when user does not exist', async ({ assert }) => {
//     const address = await AddressFactory.create()

//     await assert.rejects(
//       () => userAddressService.createUserAddress('non-existent-user', address.id, true),
//       'FOREIGN KEY constraint failed'
//     )
//   })

//   test('createUserAddress - should throw error when address does not exist', async ({ assert }) => {
//     await UserFactory.merge({ id: TEST_AUTH_USER_ID }).create()

//     await assert.rejects(
//       () => userAddressService.createUserAddress(TEST_AUTH_USER_ID, 'non-existent-address', true),
//       'FOREIGN KEY constraint failed'
//     )
//   })

//   test('createUserAddress - should throw error on duplicate user-address combination', async ({
//     assert,
//   }) => {
//     await UserFactory.merge({ id: TEST_AUTH_USER_ID }).create()
//     const address = await AddressFactory.create()

//     await userAddressService.createUserAddress(TEST_AUTH_USER_ID, address.id, true)

//     await assert.rejects(
//       () => userAddressService.createUserAddress(TEST_AUTH_USER_ID, address.id, false),
//       'UNIQUE constraint failed'
//     )
//   })
// })
