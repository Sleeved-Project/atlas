import Grade from '#models/grade'

export async function getGradeLabel(score: number): Promise<string | null> {
  const grade = await Grade.query()
    .where('min_grade', '<=', score)
    .andWhere('max_grade', '>=', score)
    .first()

  return grade?.label ?? null
}
