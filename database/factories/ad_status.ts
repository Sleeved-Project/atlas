import AdStatus from '#models/ad_status'
import Factory from '@adonisjs/lucid/factories'

export const AdStatusFactory = Factory.define(AdStatus, ({ faker }) => {
  return {
    label: faker.lorem.word(10),
  }
}).build()
