// database/factories/ad.ts
import Ad from '#models/ad'
import Factory from '@adonisjs/lucid/factories'
import { CardFactory } from './card.js'
import { AdStatusFactory } from './ad_status.js'
import { CardConditionFactory } from './card_condition.js'
import { CardFinishFactory } from './card_finish.js'
import { UserFactory } from './user.js'
import { CertificateFactory } from './certificate.js'
import { DateTime } from 'luxon'

export const AdFactory = Factory.define(Ad, ({ faker }) => {
  return {
    originalPrice: faker.number.int({ min: 100, max: 10000 }),
    rectoImageUrl: faker.image.urlPicsumPhotos(),
    versoImageUrl: faker.image.urlPicsumPhotos(),
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
  }
})
  .relation('card', () => CardFactory)
  .relation('status', () => AdStatusFactory)
  .relation('condition', () => CardConditionFactory)
  .relation('finish', () => CardFinishFactory)
  .relation('seller', () => UserFactory)
  .relation('certificate', () => CertificateFactory)
  .build()
