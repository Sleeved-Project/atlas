import Certificate from '#models/certificate'
import { v4 as uuidv4 } from 'uuid'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { CardFactory } from './card.js'

export const CertificateFactory = Factory.define(Certificate, ({ faker }) => {
  return {
    id: uuidv4(),
    cardId: 'base1-1',
    certifiedById: TEST_AUTH_USER_ID,
    gradeId: '1',
    certifiedAt: DateTime.now(),
    globalRating: faker.number.int({ min: 0, max: 9 }),
    centeringRating: faker.number.int({ min: 0, max: 9 }),
    cornerRating: faker.number.int({ min: 0, max: 9 }),
    edgeRating: faker.number.int({ min: 0, max: 9 }),
    surfaceRating: faker.number.int({ min: 0, max: 9 }),
    grade: faker.helpers.arrayElement(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']),
  }
})
  .relation('card', () => CardFactory)
  .build()
