// import { test } from '@japa/runner'
// import sinon from 'sinon'
// import User from '#models/user'
// import UsersMapper from '#mappers/users_mapper'

// test.group('UsersMapper', (group) => {
//   let sandbox: sinon.SinonSandbox

//   group.each.setup(() => {
//     sandbox = sinon.createSandbox()
//   })

//   group.each.teardown(() => {
//     sandbox.restore()
//   })

//   test('toPublicUserData - should return only public fields and exclude sensitive data', ({
//     assert,
//   }) => {
//     const user = new User()
//     const toJSONStub = sandbox.stub(user, 'toJSON')
//     toJSONStub.returns({
//       id: 'user-123',
//       username: 'pokemon_master',
//       firstname: 'Ash',
//       lastname: 'Ketchum',
//       email: 'ash@pokemon.com',
//       password: 'hashed_password',
//       profilePictureUrl: 'https://example.com/ash.jpg',
//       description: 'I want to be the very best',
//       createdAt: '2024-01-15T10:30:00.000Z',
//       updatedAt: '2024-01-20T15:45:00.000Z',
//     })

//     const result = UsersMapper.toPublicUserData(user)

//     const expectedKeys = [
//       'id',
//       'username',
//       'firstname',
//       'lastname',
//       'profilePictureUrl',
//       'createdAt',
//     ]
//     const actualKeys = Object.keys(result)
//     assert.sameMembers(actualKeys, expectedKeys)

//     assert.equal(result.id, 'user-123')
//     assert.equal(result.username, 'pokemon_master')
//     assert.equal(result.firstname, 'Ash')
//     assert.equal(result.lastname, 'Ketchum')
//     assert.equal(result.profilePictureUrl, 'https://example.com/ash.jpg')
//     assert.equal(result.createdAt, '2024-01-15T10:30:00.000Z')

//     assert.notProperty(result, 'email')
//     assert.notProperty(result, 'password')
//     assert.notProperty(result, 'description')
//     assert.notProperty(result, 'updatedAt')

//     sinon.assert.calledOnce(toJSONStub)
//   })

//   test('toDetailedUserData - should return public fields plus description', ({ assert }) => {
//     const user = new User()
//     const toJSONStub = sandbox.stub(user, 'toJSON')
//     toJSONStub.returns({
//       id: 'user-456',
//       username: 'gym_leader_brock',
//       firstname: 'Brock',
//       lastname: 'Harrison',
//       email: 'brock@pewtergym.com',
//       password: 'another_hashed_password',
//       profilePictureUrl: 'https://example.com/brock.jpg',
//       description: 'Pewter City Gym Leader specializing in Rock-type Pokemon',
//       createdAt: '2024-01-10T08:15:00.000Z',
//       updatedAt: '2024-01-25T12:20:00.000Z',
//     })

//     const result = UsersMapper.toDetailedUserData(user)

//     const expectedKeys = [
//       'id',
//       'username',
//       'firstname',
//       'lastname',
//       'profilePictureUrl',
//       'description',
//       'createdAt',
//     ]
//     const actualKeys = Object.keys(result)
//     assert.sameMembers(actualKeys, expectedKeys)

//     assert.equal(result.id, 'user-456')
//     assert.equal(result.username, 'gym_leader_brock')
//     assert.equal(result.firstname, 'Brock')
//     assert.equal(result.lastname, 'Harrison')
//     assert.equal(result.profilePictureUrl, 'https://example.com/brock.jpg')
//     assert.equal(result.description, 'Pewter City Gym Leader specializing in Rock-type Pokemon')
//     assert.equal(result.createdAt, '2024-01-10T08:15:00.000Z')

//     assert.notProperty(result, 'email')
//     assert.notProperty(result, 'password')
//     assert.notProperty(result, 'updatedAt')

//     sinon.assert.calledOnce(toJSONStub)
//   })

//   test('toDetailedUserData - should handle null description gracefully', ({ assert }) => {
//     const user = new User()
//     const toJSONStub = sandbox.stub(user, 'toJSON')
//     toJSONStub.returns({
//       id: 'user-789',
//       username: 'new_trainer',
//       firstname: 'Misty',
//       lastname: 'Williams',
//       email: 'misty@ceruleangym.com',
//       password: 'water_type_master',
//       profilePictureUrl: null,
//       description: null,
//       createdAt: '2024-01-30T14:00:00.000Z',
//       updatedAt: '2024-01-30T14:00:00.000Z',
//     })

//     const result = UsersMapper.toDetailedUserData(user)

//     assert.equal(result.id, 'user-789')
//     assert.equal(result.username, 'new_trainer')
//     assert.equal(result.firstname, 'Misty')
//     assert.equal(result.lastname, 'Williams')
//     assert.isNull(result.profilePictureUrl)
//     assert.isNull(result.description)
//     assert.equal(result.createdAt, '2024-01-30T14:00:00.000Z')

//     const expectedKeys = [
//       'id',
//       'username',
//       'firstname',
//       'lastname',
//       'profilePictureUrl',
//       'description',
//       'createdAt',
//     ]
//     const actualKeys = Object.keys(result)
//     assert.sameMembers(actualKeys, expectedKeys)

//     sinon.assert.calledOnce(toJSONStub)
//   })
// })
