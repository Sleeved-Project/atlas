import Grade from '#models/grade'
import Factory from '@adonisjs/lucid/factories'

export const GradeFactory = Factory.define(Grade, ({ faker }) => {
  return {
    label: faker.lorem.word(10),
    description: faker.lorem.sentence(),
    code: faker.string.alpha({ length: 2 }).toUpperCase(),
    minGrade: faker.number.int({ min: 0, max: 9 }),
    maxGrade: faker.number.int({ min: 1, max: 10 }),
  }
}).build()
