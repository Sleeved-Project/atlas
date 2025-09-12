import Grade from '#models/grade'
import Factory from '@adonisjs/lucid/factories'
import { v4 as uuidv4 } from 'uuid'

export const GradeFactory = Factory.define(Grade, ({ faker }) => {
  const minGrade = faker.number.int({ min: 0, max: 9 })
  const maxGrade = faker.number.int({ min: Math.max(minGrade, 0), max: 10 })

  return {
    id: uuidv4(),
    minGrade,
    maxGrade: Math.max(maxGrade, minGrade),
    label: faker.helpers.arrayElement(['Mint', 'Near Mint', 'Excellent', 'Good', 'Played']),
    description: faker.lorem.sentence(),
    code: faker.string.alphanumeric(6).toUpperCase(),
  }
})
  .state('mint', (grade) => {
    grade.minGrade = 9
    grade.maxGrade = 10
    grade.label = 'Mint'
  })
  .state('poor', (grade) => {
    grade.minGrade = 1
    grade.maxGrade = 3
    grade.label = 'Poor'
  })
  .build()
