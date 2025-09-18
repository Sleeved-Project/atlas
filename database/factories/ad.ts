// database/factories/ad.ts
import Ad from '#models/ad'
import Factory from '@adonisjs/lucid/factories'
import { CardFactory } from './card.js'
import { AdStatusFactory } from './ad_status.js'
import { CardConditionBasicFactory } from './card_condition.js'
import { CardFinishBasicFactory } from './card_finish.js'
import { UserFactory } from './user.js'
import { CertificateFactory } from './certificate.js'

export const AdFactory = Factory.define(Ad, ({ faker }) => {
  return {
    id: faker.string.uuid(),
    originalPrice: faker.number.int({ min: 100, max: 10000 }),
    rectoImageUrl: faker.image.urlPicsumPhotos(),
    versoImageUrl: faker.image.urlPicsumPhotos(),
    cardId: faker.string.uuid(),
    statusId: 1,
    conditionId: 1,
    finishId: 1,
    sellerId: faker.string.uuid(),
    certificateId: null,
  }
})
  .relation('card', () => CardFactory)
  .relation('status', () => AdStatusFactory)
  .relation('condition', () => CardConditionBasicFactory)
  .relation('finish', () => CardFinishBasicFactory)
  .relation('seller', () => UserFactory)
  .relation('certificate', () => CertificateFactory)
  .build()
