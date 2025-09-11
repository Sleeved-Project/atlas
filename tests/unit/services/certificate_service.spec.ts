import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import CertificateService from '#services/certificate_service'
import { CertificateFactory } from '#database/factories/certificate'
import { CardFactory } from '#database/factories/card'
import { GradeFactory } from '#database/factories/grade'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { UserFactory } from '#database/factories/user'

test.group('CertificateService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let certificateService: CertificateService

  group.setup(() => {
    certificateService = new CertificateService()
  })

  test('getCertificateByCardIdCertifyedByAndId - should return certificate when it exists', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.merge({ id: 'base1-1' }).create()
    const grade = await GradeFactory.create()
    const userId = 'test-user-id'

    await UserFactory.merge({ id: userId }).create()

    const certificate = await CertificateFactory.merge({
      cardId: card.id,
      certifiedById: userId,
      gradeId: grade.id,
      globalRating: 9,
      centeringRating: 8,
      cornerRating: 7,
      edgeRating: 6,
      surfaceRating: 5,
    }).create()

    const result = await certificateService.getCertificateByCardIdCertifyedByAndId(
      userId,
      card.id,
      certificate.id
    )

    assert.exists(result, 'Certificate should exist')
    assert.equal(result.id, certificate.id)
    assert.equal(result.cardId, card.id)
    assert.equal(result.certifiedById, userId)

    assert.strictEqual(Number(result.globalRating), 9)
    assert.strictEqual(Number(result.centeringRating), 8)
    assert.strictEqual(Number(result.cornerRating), 7)
    assert.strictEqual(Number(result.edgeRating), 6)
    assert.strictEqual(Number(result.surfaceRating), 5)
  })

  test('getCertificateByCardIdCertifyedByAndId - should throw exception when certificate does not exist', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.merge({ id: 'base1-1' }).create()

    const nonExistentCertificateId = 'non-existent-certificate-id'
    const userId = 'test-user-id'

    // Test non-existent certificate
    await assert.rejects(async () => {
      await certificateService.getCertificateByCardIdCertifyedByAndId(
        userId,
        card.id,
        nonExistentCertificateId
      )
    }, 'Row not found')
  })

  test('getCertificateByCardIdCertifyedByAndId - should not return certificate with different userId', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.merge({ id: 'base1-1' }).create()
    const grade = await GradeFactory.create()
    const userId = 'test-user-id'
    const otherUserId = 'other-user-id'

    await UserFactory.merge({ id: userId }).create()

    const certificate = await CertificateFactory.merge({
      cardId: card.id,
      certifiedById: userId,
      gradeId: grade.id,
    }).create()

    await assert.rejects(async () => {
      await certificateService.getCertificateByCardIdCertifyedByAndId(
        otherUserId,
        card.id,
        certificate.id
      )
    }, 'Row not found')
  })

  test('getCertificateByCardIdCertifyedByAndId - should not return certificate with different cardId', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card1 = await CardFactory.merge({ id: 'base1-1' }).create()
    const card2 = await CardFactory.merge({ id: 'base1-2' }).create()
    const grade = await GradeFactory.create()
    const userId = 'test-user-id'

    await UserFactory.merge({ id: userId }).create()

    const certificate = await CertificateFactory.merge({
      cardId: card1.id,
      certifiedById: userId,
      gradeId: grade.id,
    }).create()

    // Test with wrong card ID
    await assert.rejects(async () => {
      await certificateService.getCertificateByCardIdCertifyedByAndId(
        userId,
        card2.id, // Different card ID
        certificate.id
      )
    }, 'Row not found')
  })
})
