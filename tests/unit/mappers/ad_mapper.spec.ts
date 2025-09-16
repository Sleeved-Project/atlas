import { test } from '@japa/runner'
import sinon from 'sinon'
import AdMapper from '#mappers/ad_mapper'
import Ad from '#models/ad'

test.group('AdMapper', (group) => {
  let sandbox: sinon.SinonSandbox

  group.each.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('toListData - should return correctly formatted ad data with all required fields', ({
    assert,
  }) => {
    const mockStatus = { id: 1, name: 'active' }
    const mockCondition = { id: 1, name: 'Near Mint' }
    const mockFinish = { id: 1, name: 'Normal' }
    const mockCard = { id: 'base1-4', name: 'Charizard' }
    const mockCertificate = { id: 'cert-123', grade: 10 }
    const mockSeller = { id: 'seller-456', username: 'pokemon_collector' }

    const ad = new Ad()
    const toJSONStub = sandbox.stub(ad, 'toJSON')
    toJSONStub.returns({
      id: 'ad-789',
      originalPrice: 299.99,
      rectoImageUrl: 'https://example.com/charizard-front.jpg',
      versoImageUrl: 'https://example.com/charizard-back.jpg',
      status: mockStatus,
      condition: mockCondition,
      finish: mockFinish,
      card: mockCard,
      certificate: mockCertificate,
      seller: mockSeller,
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T15:45:00.000Z',
      sellerId: 'seller-456',
      statusId: 1,
      conditionId: 1,
      finishId: 1,
      cardId: 'base1-4',
      certificateId: 'cert-123',
    })

    const result = AdMapper.toListData(ad)

    const expectedKeys = [
      'id',
      'originalPrice',
      'rectoImageUrl',
      'versoImageUrl',
      'status',
      'condition',
      'finish',
      'card',
      'certificate',
      'seller',
      'createdAt',
      'updatedAt',
    ]
    const actualKeys = Object.keys(result)
    assert.sameMembers(actualKeys, expectedKeys)

    assert.equal(result.id, 'ad-789')
    assert.equal(result.originalPrice, 299.99)
    assert.equal(result.rectoImageUrl, 'https://example.com/charizard-front.jpg')
    assert.equal(result.versoImageUrl, 'https://example.com/charizard-back.jpg')
    assert.deepEqual(result.status, mockStatus)
    assert.deepEqual(result.condition, mockCondition)
    assert.deepEqual(result.finish, mockFinish)
    assert.deepEqual(result.card, mockCard)
    assert.deepEqual(result.certificate, mockCertificate)
    assert.deepEqual(result.seller, mockSeller)
    assert.equal(result.createdAt, '2024-01-15T10:30:00.000Z')
    assert.equal(result.updatedAt, '2024-01-20T15:45:00.000Z')

    assert.notProperty(result, 'sellerId')
    assert.notProperty(result, 'statusId')
    assert.notProperty(result, 'conditionId')
    assert.notProperty(result, 'finishId')
    assert.notProperty(result, 'cardId')
    assert.notProperty(result, 'certificateId')

    sinon.assert.calledOnce(toJSONStub)
  })

  test('toListData - should handle null certificate gracefully', ({ assert }) => {
    const mockStatus = { id: 1, name: 'active' }
    const mockCondition = { id: 2, name: 'Lightly Played' }
    const mockFinish = { id: 1, name: 'Normal' }
    const mockCard = { id: 'base1-6', name: 'Gyarados' }
    const mockSeller = { id: 'seller-789', username: 'water_pokemon_fan' }

    const ad = new Ad()
    const toJSONStub = sandbox.stub(ad, 'toJSON')
    toJSONStub.returns({
      id: 'ad-456',
      originalPrice: 89.5,
      rectoImageUrl: 'https://example.com/gyarados-front.jpg',
      versoImageUrl: 'https://example.com/gyarados-back.jpg',
      status: mockStatus,
      condition: mockCondition,
      finish: mockFinish,
      card: mockCard,
      certificate: null,
      seller: mockSeller,
      createdAt: '2024-01-18T09:15:00.000Z',
      updatedAt: '2024-01-22T11:30:00.000Z',
      sellerId: 'seller-789',
      certificateId: null,
    })

    const result = AdMapper.toListData(ad)

    assert.equal(result.id, 'ad-456')
    assert.equal(result.originalPrice, 89.5)
    assert.isNull(result.certificate)
    assert.deepEqual(result.status, mockStatus)
    assert.deepEqual(result.condition, mockCondition)
    assert.deepEqual(result.finish, mockFinish)
    assert.deepEqual(result.card, mockCard)
    assert.deepEqual(result.seller, mockSeller)

    const expectedKeys = [
      'id',
      'originalPrice',
      'rectoImageUrl',
      'versoImageUrl',
      'status',
      'condition',
      'finish',
      'card',
      'certificate',
      'seller',
      'createdAt',
      'updatedAt',
    ]
    const actualKeys = Object.keys(result)
    assert.sameMembers(actualKeys, expectedKeys)

    sinon.assert.calledOnce(toJSONStub)
  })

  test('toListData - should preserve nested object relationships correctly', ({ assert }) => {
    const mockCard = {
      id: 'xy1-144',
      name: 'Charizard EX',
      imageSmall: 'https://example.com/charizard-small.jpg',
      imageLarge: 'https://example.com/charizard-large.jpg',
    }
    const mockSeller = {
      id: 'seller-premium',
      username: 'premium_collector',
      profilePictureUrl: 'https://example.com/profile.jpg',
    }
    const mockCertificate = {
      id: 'psa-9876',
      grade: 9,
      company: 'PSA',
    }

    const ad = new Ad()
    const toJSONStub = sandbox.stub(ad, 'toJSON')
    toJSONStub.returns({
      id: 'ad-premium-123',
      originalPrice: 1250.0,
      rectoImageUrl: 'https://example.com/charizard-ex-front.jpg',
      versoImageUrl: 'https://example.com/charizard-ex-back.jpg',
      status: { id: 1, name: 'active' },
      condition: { id: 1, name: 'Near Mint' },
      finish: { id: 2, name: 'Holofoil' },
      card: mockCard,
      certificate: mockCertificate,
      seller: mockSeller,
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-25T16:20:00.000Z',
    })

    const result = AdMapper.toListData(ad)

    assert.deepEqual(result.card, mockCard)
    assert.equal(result.card.id, 'xy1-144')
    assert.equal(result.card.name, 'Charizard EX')
    assert.property(result.card, 'imageSmall')
    assert.property(result.card, 'imageLarge')

    assert.deepEqual(result.seller, mockSeller)
    assert.equal(result.seller.id, 'seller-premium')
    assert.equal(result.seller.username, 'premium_collector')
    assert.property(result.seller, 'profilePictureUrl')

    assert.deepEqual(result.certificate, mockCertificate)
    assert.equal(result.certificate.id, 'psa-9876')
    assert.equal(result.certificate.grade, 9)
    assert.property(result.certificate, 'company')

    assert.equal(result.id, 'ad-premium-123')
    assert.equal(result.originalPrice, 1250.0)

    sinon.assert.calledOnce(toJSONStub)
  })
})
