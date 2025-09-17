// import { test } from '@japa/runner'
// import CertificateMapper from '#mappers/certificate_mapper'
// import { CertificateFactory } from '#database/factories/certificate'
// import { GradeFactory } from '#database/factories/grade'
// import testUtils from '@adonisjs/core/services/test_utils'
// import { ArtistFactory } from '#database/factories/artist'
// import { RarityFactory } from '#database/factories/rarity'
// import { LegalityFactory } from '#database/factories/legality'
// import { SetFactory } from '#database/factories/set'
// import { CardFactory } from '#database/factories/card'

// test.group('CertificateMapper', (group) => {
//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   test('toCertificationOutputDTO - should map certificate with grade to DTO', async ({
//     assert,
//   }) => {
//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     const card = await CardFactory.merge({ id: 'base1-1' }).create()
//     const grade = await GradeFactory.merge({
//       label: 'Gem Mint',
//       description: 'Perfect condition',
//       code: 'GM',
//     }).create()

//     const certificate = await CertificateFactory.merge({
//       cardId: card.id,
//       globalRating: 9.5,
//       centeringRating: 9.4,
//       cornerRating: 9.6,
//       edgeRating: 9.3,
//       surfaceRating: 9.7,
//       gradeId: grade.id,
//     }).create()

//     const result = CertificateMapper.toCertificationOutputDTO(certificate, grade)

//     assert.properties(result, [
//       'id',
//       'globalRating',
//       'centeringRating',
//       'cornerRating',
//       'edgeRating',
//       'surfaceRating',
//       'certifiedAt',
//       'grade',
//     ])
//     assert.equal(result.globalRating, '9.5')
//     assert.equal(result.centeringRating, '9.4')
//     assert.equal(result.cornerRating, '9.6')
//     assert.equal(result.edgeRating, '9.3')
//     assert.equal(result.surfaceRating, '9.7')
//     assert.deepEqual(result.grade, {
//       label: 'Gem Mint',
//       description: 'Perfect condition',
//       code: 'GM',
//     })
//   })

//   test('toCertificationOutputDTO - should format integer ratings with decimal point', async ({
//     assert,
//   }) => {
//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     const card = await CardFactory.merge({ id: 'base1-1' }).create()
//     const grade = await GradeFactory.merge({
//       label: 'Poor',
//       code: 'P',
//     }).create()

//     const certificate = await CertificateFactory.merge({
//       cardId: card.id,
//       globalRating: 5,
//       centeringRating: 4,
//       cornerRating: 6,
//       edgeRating: 5,
//       surfaceRating: 5,
//       gradeId: grade.id,
//     }).create()

//     const result = CertificateMapper.toCertificationOutputDTO(certificate, grade)

//     assert.equal(result.globalRating, '5.0')
//     assert.equal(result.centeringRating, '4.0')
//     assert.equal(result.cornerRating, '6.0')
//     assert.equal(result.edgeRating, '5.0')
//     assert.equal(result.surfaceRating, '5.0')
//   })
// })
