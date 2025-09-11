import Ad from '#models/ad'
import Factory from '@adonisjs/lucid/factories'
import { CardFactory } from './card.js'
import { CardConditionFactory } from './card_condition.js'
import { CardFinishFactory } from './card_finish.js'
import { UserFactory } from './user.js'
import { CertificateFactory } from './certificate.js'
import { AdStatusFactory } from './ad_status.js'

export const AdFactory = Factory.define(Ad, ({ faker }) => {
  return {
    originalPrice: faker.number.int({ min: 100, max: 50000 }),
    rectoImageUrl: faker.image.url(),
    versoImageUrl: faker.image.url(),
    statusId: 1,
    conditionId: 2,
    finishId: 1,
    certificateId: null,
  }
})
  .relation('card', () => CardFactory)
  .relation('seller', () => UserFactory)
  .relation('condition', () => CardConditionFactory)
  .relation('finish', () => CardFinishFactory)
  .relation('certificate', () => CertificateFactory)
  .relation('status', () => AdStatusFactory)
  .build()
