import Certificate from '#models/certificate'
import Factory from '@adonisjs/lucid/factories'
import { CardFactory } from './card.js'
import { GradeFactory } from './grade.js'

export const CertificateFactory = Factory.define(Certificate, ({ faker }) => {
  return {
    globalRating: faker.number.int({ min: 1, max: 10 }),
    centeringRating: faker.number.int({ min: 1, max: 10 }),
    cornerRating: faker.number.int({ min: 1, max: 10 }),
    edgeRating: faker.number.int({ min: 1, max: 10 }),
    surfaceRating: faker.number.int({ min: 1, max: 10 }),
  }
})
  .relation('card', () => CardFactory)
  .relation('grade', () => GradeFactory)
  .state('perfect', (certificate) => {
    certificate.globalRating = 10
    certificate.centeringRating = 10
    certificate.cornerRating = 10
    certificate.edgeRating = 10
    certificate.surfaceRating = 10
  })
  .state('poor', (certificate) => {
    certificate.globalRating = 2
    certificate.centeringRating = 2
    certificate.cornerRating = 1
    certificate.edgeRating = 2
    certificate.surfaceRating = 3
  })
  .build()
