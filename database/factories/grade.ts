import Grade from '#models/grade'
import Factory from '@adonisjs/lucid/factories'

export const GradeFactory = Factory.define(Grade, ({ faker }) => {
  return {
    id: faker.string.uuid(),
    label: faker.helpers.arrayElement(['Gem Mint', 'Mint', 'Poor Mint']),
    description: faker.lorem.sentence(),
    code: faker.helpers.arrayElement(['GM', 'M', 'PM']),
    minGrade: faker.number.int({ min: 0, max: 7 }),
    maxGrade: faker.number.int({ min: 8, max: 10 }),
  }
}).build()
