import User from '#models/user'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

export const UserFactory = Factory.define(User, async ({ faker }) => {
  return {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    phone: faker.phone.number(),
    description: faker.lorem.paragraph(),
    profilePictureUrl: faker.image.avatar(),
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
    deletedAt: null,
  }
}).build()
