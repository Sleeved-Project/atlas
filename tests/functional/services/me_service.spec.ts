import { test } from '@japa/runner'
import MeService from '#services/me_service'
import User from '#models/user'
import sinon from 'sinon'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('MeService', (group) => {
  let meService: MeService
  let sandbox: sinon.SinonSandbox

  group.each.setup(() => {
    meService = new MeService()
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

    const user = await meService.createUser(authUser)

    assert.equal(user.id, authUser.id)
    assert.equal(user.username, authUser.username)

    const savedUser = await User.find(authUser.id)
    assert.isNotNull(savedUser)
    assert.equal(savedUser?.id, authUser.id)
    assert.equal(savedUser?.username, authUser.username)
  })

  test('getUserById returns a user by ID', async ({ assert }) => {
    const userId = 'test-user-id'
    const username = 'testuser'

    await User.create({
      id: userId,
      username: username,
    })

    const user = await meService.getUserById(userId)

    assert.equal(user.id, userId)
    assert.equal(user.username, username)
  })

  test('getUserById throws exception for non-existent user', async ({ assert }) => {
    await assert.rejects(() => meService.getUserById('non-existent-id'), 'Row not found')
  })

  test('getGradingTokenCount - should return remaining tokens for user', async ({ assert }) => {
    const user = await User.create({
      id: 'test-user-id',
      username: 'testuser',
      remainingCertificateToken: 5,
    })

    const tokenCount = await meService.getGradingTokenCount(user.id)

    assert.equal(tokenCount, 5)
  })

  test('getGradingTokenCount - should throw error for non-existent user', async ({ assert }) => {
    await assert.rejects(() => meService.getGradingTokenCount('non-existent-id'), 'Row not found')
  })

  test('decrementGradingTokenCount - should decrease token count by 1', async ({ assert }) => {
    const user = await User.create({
      id: 'test-user-id',
      username: 'testuser',
      remainingCertificateToken: 3,
    })

    await meService.decrementGradingTokenCount(user.id)

    const updatedUser = await User.findOrFail(user.id)
    assert.equal(updatedUser.remainingCertificateToken, 2)
  })

  test('decrementGradingTokenCount - should throw error for non-existent user', async ({
    assert,
  }) => {
    await assert.rejects(
      () => meService.decrementGradingTokenCount('non-existent-id'),
      'Row not found'
    )
  })
})
