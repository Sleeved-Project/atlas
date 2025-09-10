import Grade from '#models/grade'
import Factory from '@adonisjs/lucid/factories'
import { v4 as uuidv4 } from 'uuid'

export const GradeFactory = Factory.define(Grade, ({ faker }) => {
  return {
    id: uuidv4(),
    minGrade: faker.number.int({ min: 1, max: 5 }),
    maxGrade: faker.number.int({ min: 6, max: 10 }),
    label: faker.helpers.arrayElement(['Poor', 'Fair', 'Good', 'Very Good', 'Excellent', 'Mint']),
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
