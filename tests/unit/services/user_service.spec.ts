import { test } from '@japa/runner'
import UserService from '#services/user_service'
import User from '#models/user'
import sinon from 'sinon'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('UserService', (group) => {
  let userService: UserService
  let sandbox: sinon.SinonSandbox

  group.each.setup(() => {
    userService = new UserService()
    sandbox = sinon.createSandbox()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('createUser creates a user with authUser data', async ({ assert }) => {
    const authUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      isVerified: 1,
      role: 'user',
    }

    const user = await userService.createUser(authUser)

    assert.equal(user.id, authUser.id)
    assert.equal(user.username, authUser.username)

    const savedUser = await User.find(authUser.id)
    assert.isNotNull(savedUser)
    assert.equal(savedUser?.id, authUser.id)
    assert.equal(savedUser?.username, authUser.username)
  })
})
