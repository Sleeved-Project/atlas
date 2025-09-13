import { test } from '@japa/runner'
import { GradeFactory } from '#database/factories/grade'
import GradeService from '#services/grade_service'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('GradeService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let gradeService: GradeService

  group.setup(() => {
    gradeService = new GradeService()
  })

  test('getGradeByScore - should return correct grade for given score', async ({ assert }) => {
    await GradeFactory.merge([
      { minGrade: 0, maxGrade: 5, label: 'Poor', code: 'P' },
      { minGrade: 6, maxGrade: 8, label: 'Good', code: 'G' },
      { minGrade: 9, maxGrade: 10, label: 'Mint', code: 'M' },
    ]).createMany(3)

    const grade = await gradeService.getGradeByScore(7)

    assert.equal(grade.label, 'Good')
    assert.equal(grade.code, 'G')
    assert.properties(grade.$attributes, ['id', 'label', 'description', 'code'])
  })

  test('getGradeByScore - should throw error when no grade matches score', async ({ assert }) => {
    await GradeFactory.merge([
      { minGrade: 6, maxGrade: 8 },
      { minGrade: 9, maxGrade: 10 },
    ]).createMany(2)

    await assert.rejects(() => gradeService.getGradeByScore(4), 'Row not found')
  })

  test('getGradeByScore - should handle boundary values correctly', async ({ assert }) => {
    await GradeFactory.merge([
      { minGrade: 0, maxGrade: 5, label: 'Poor' },
      { minGrade: 6, maxGrade: 8, label: 'Good' },
      { minGrade: 9, maxGrade: 10, label: 'Mint' },
    ]).createMany(3)

    const minGrade = await gradeService.getGradeByScore(0)
    const maxGrade = await gradeService.getGradeByScore(10)

    assert.equal(minGrade.label, 'Poor')
    assert.equal(maxGrade.label, 'Mint')
  })
})
