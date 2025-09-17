// import { test } from '@japa/runner'
// import testUtils from '@adonisjs/core/services/test_utils'
// import IdentificationProcessor from '#processors/identification_processor'
// import CardService from '#services/card_service'
// import { ArtistFactory } from '#database/factories/artist'
// import { RarityFactory } from '#database/factories/rarity'
// import { LegalityFactory } from '#database/factories/legality'
// import { SetFactory } from '#database/factories/set'
// import { CardFactory } from '#database/factories/card'
// import { errors as lucidErrors } from '@adonisjs/lucid'
// import sinon from 'sinon'

// test.group('IdentificationProcessor', (group) => {
//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   let identificationProcessor: IdentificationProcessor
//   let cardService: CardService

//   group.setup(() => {
//     cardService = new CardService()
//     identificationProcessor = new IdentificationProcessor(cardService)
//   })

//   test('processIdentification - should process regular card identification successfully', async ({
//     assert,
//   }) => {
//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     await CardFactory.merge({
//       id: 'base1-1',
//       name: 'Pikachu',
//       imageSmall: 'https://example.com/pikachu-small.png',
//     }).create()

//     const cardIdentificationResult = {
//       id: 'base1-1',
//       similarity: 0.95,
//       extractedTempImageUrl: '/api/v1/uploads/temp-image.png',
//     }

//     const result = await identificationProcessor.processIdentification(cardIdentificationResult)

//     assert.properties(result, [
//       'id',
//       'name',
//       'potentialMatchedCard',
//       'similarity',
//       'extractedTempImageUrl',
//       'is_back_side',
//     ])
//     assert.equal(result.id, 'base1-1')
//     assert.equal(result.name, 'Pikachu')
//     assert.equal(result.potentialMatchedCard, 'https://example.com/pikachu-small.png')
//     assert.equal(result.similarity, 0.95)
//     assert.equal(result.extractedTempImageUrl, '/api/v1/uploads/temp-image.png')
//     assert.equal(result.is_back_side, false)
//   })

//   test('processIdentification - should process back-side card correctly', async ({ assert }) => {
//     const backSideCardResult = {
//       id: 'back-side',
//       similarity: 0.92,
//       extractedTempImageUrl: '/api/v1/uploads/back-side-image.png',
//     }

//     const getMinimalCardDetailByIdSpy = sinon.spy(cardService, 'getMinimalCardDetailById')

//     const result = await identificationProcessor.processIdentification(backSideCardResult)

//     assert.properties(result, ['id', 'name', 'similarity', 'extractedTempImageUrl', 'is_back_side'])
//     assert.equal(result.id, 'back-side')
//     assert.equal(result.name, 'Card Back Side')
//     assert.equal(result.similarity, 0.92)
//     assert.equal(result.extractedTempImageUrl, '/api/v1/uploads/back-side-image.png')
//     assert.equal(result.is_back_side, true)

//     assert.isTrue(getMinimalCardDetailByIdSpy.notCalled)

//     getMinimalCardDetailByIdSpy.restore()
//   })

//   test('processIdentification - should throw when card not found in database', async ({
//     assert,
//   }) => {
//     const nonExistentCardResult = {
//       id: 'non-existent-id',
//       similarity: 0.85,
//       extractedTempImageUrl: '/api/v1/uploads/unknown-card.png',
//     }

//     sinon
//       .stub(cardService, 'getMinimalCardDetailById')
//       .withArgs('non-existent-id')
//       .rejects(new lucidErrors.E_ROW_NOT_FOUND())

//     await assert.rejects(async () => {
//       await identificationProcessor.processIdentification(nonExistentCardResult)
//     }, /Row not found/)
//   })
// })
