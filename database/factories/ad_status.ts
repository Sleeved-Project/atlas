import AdStatus from '#models/ad_status'
import Factory from '@adonisjs/lucid/factories'

export const AdStatusFactory = Factory.define(AdStatus, ({ faker }) => {
  return {
    id: faker.number.int({ min: 1, max: 100 }),
    label: faker.helpers.arrayElement(['Draft', 'Published', 'Sold', 'Cancelled', 'Expired']),
  }
})
  .state('published', (status) => {
    status.id = 1
    status.label = 'Published'
  })
  .state('sold', (status) => {
    status.id = 2
    status.label = 'Sold'
  })
  .state('cancelled', (status) => {
    status.id = 3
    status.label = 'Cancelled'
  })
  .build()
