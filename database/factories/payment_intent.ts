// database/factories/payment_intent_factory.ts
import Factory from '@adonisjs/lucid/factories'
import PaymentIntent from '#models/payment_intent'
import { DateTime } from 'luxon'
import { AdFactory } from './ad.js'
import { UserFactory } from './user.js'

export const PaymentIntentFactory = Factory.define(PaymentIntent, ({ faker }) => {
  return {
    id: faker.string.uuid(),
    fromId: faker.string.uuid(),
    toId: faker.string.uuid(),
    adId: faker.string.uuid(),
    status: 'created',
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
  }
})
  .relation('from', () => UserFactory)
  .relation('to', () => UserFactory)
  .relation('ad', () => AdFactory)
  .build()
