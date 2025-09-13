import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import CertificationProcessor from '#processors/certification_processor'
import GradeService from '#services/grade_service'
import CertificateService from '#services/certificate_service'
import MeService from '#services/me_service'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { CardFactory } from '#database/factories/card'
import { GradeFactory } from '#database/factories/grade'
import { UserFactory } from '#database/factories/user'

test.group('CertificationProcessor', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let certificationProcessor: CertificationProcessor
  let gradeService: GradeService
  let certificateService: CertificateService
  let meService: MeService

  group.setup(() => {
    gradeService = new GradeService()
    certificateService = new CertificateService()
    meService = new MeService()
    certificationProcessor = new CertificationProcessor(gradeService, certificateService, meService)
  })

  test('processCertification - should process certification successfully', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.merge({ id: 'base1-1' }).create()
    await GradeFactory.merge({
      minGrade: 8,
      maxGrade: 9,
      label: 'Near Mint',
      code: 'PSA9',
    }).create()

    const user = await UserFactory.merge({
      remaningCertificateToken: 1,
    }).create()

    const scanGradeDTO = {
      globaleRating: 8.5,
      centerRating: 8.2,
      cornerRating: 8.7,
      edgeRating: 8.4,
      surfaceRating: 8.6,
    }

    const result = await certificationProcessor.processCertification(user.id, card.id, scanGradeDTO)

    assert.properties(result, ['id', 'grade', 'globalRating'])
    assert.equal(result.grade.label, 'Near Mint')
    assert.equal(result.grade.code, 'PSA9')
    assert.equal(result.globalRating, scanGradeDTO.globaleRating)

    const updatedUser = await meService.getUserById(user.id)
    assert.equal(updatedUser.remaningCertificateToken, 0)
  })

  test('processCertification - should throw when no matching grade found', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.merge({ id: 'base1-1' }).create()
    await GradeFactory.merge({
      minGrade: 8,
      maxGrade: 9,
    }).create()

    const user = await UserFactory.merge({
      remaningCertificateToken: 1,
    }).create()

    const scanGradeDTO = {
      globaleRating: 7.5,
      centerRating: 7.2,
      cornerRating: 7.7,
      edgeRating: 7.4,
      surfaceRating: 7.6,
    }

    await assert.rejects(
      () => certificationProcessor.processCertification(user.id, card.id, scanGradeDTO),
      'Row not found'
    )

    const userAfterError = await meService.getUserById(user.id)
    assert.equal(userAfterError.remaningCertificateToken, 1)
  })
})
