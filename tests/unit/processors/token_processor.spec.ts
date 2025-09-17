// import { test } from '@japa/runner'
// import TokenProcessor from '#processors/token_processor'
// import MeService from '#services/me_service'
// import { UserFactory } from '#database/factories/user'
// import testUtils from '@adonisjs/core/services/test_utils'

// test.group('TokenProcessor', (group) => {
//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   let tokenProcessor: TokenProcessor
//   let meService: MeService

//   group.setup(() => {
//     meService = new MeService()
//     tokenProcessor = new TokenProcessor(meService)
//   })

//   test('verifyGradingTokens - should not throw when user has tokens', async ({ assert }) => {
//     const user = await UserFactory.merge({
//       remainingCertificateToken: 5,
//     }).create()

//     await assert.doesNotReject(() => tokenProcessor.verifyGradingTokens(user.id))
//   })

//   test('verifyGradingTokens - should throw when user has no tokens', async ({ assert }) => {
//     const user = await UserFactory.merge({
//       remainingCertificateToken: 0,
//     }).create()

//     await assert.rejects(
//       () => tokenProcessor.verifyGradingTokens(user.id),
//       'Not enough token to perform operation'
//     )
//   })
// })
