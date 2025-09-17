import Certificate from '#models/certificate'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { CardFactory } from './card.js'
import { UserFactory } from './user.js'
import { GradeFactory } from './grade.js'

export const CertificateFactory = Factory.define(Certificate, ({ faker }) => {
  return {
    certifiedAt: DateTime.now(),
    globalRating: faker.number.int({ min: 0, max: 9 }),
    centeringRating: faker.number.int({ min: 0, max: 9 }),
    cornerRating: faker.number.int({ min: 0, max: 9 }),
    edgeRating: faker.number.int({ min: 0, max: 9 }),
    surfaceRating: faker.number.int({ min: 0, max: 9 }),
  }
})
  .relation('card', () => CardFactory)
  .relation('certifiedBy', () => UserFactory)
  .relation('grade', () => GradeFactory)
  .build()
