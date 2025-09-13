import Grade from '#models/grade'

export default class GradeService {
  async getGradeByScore(score: number): Promise<Grade> {
    return await Grade.query()
      .select('id', 'label', 'description', 'code')
      .where('min_grade', '<=', score)
      .andWhere('max_grade', '>=', score)
      .firstOrFail()
  }
}
