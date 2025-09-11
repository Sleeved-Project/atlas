import Factory from '@adonisjs/lucid/factories'
import AdStatus from '#models/ad_status'

export const AdStatusFactory = Factory.define(AdStatus, ({ faker }) => {
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    label: faker.helpers.arrayElement(['Draft', 'Published', 'Sold', 'Archived']),
  }
}).build()
