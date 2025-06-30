import { test } from '@japa/runner'
import FolioService from '#services/folio_service'
import testUtils from '@adonisjs/core/services/test_utils'
import Folio from '#models/folio'
import { FolioFactory } from '#database/factories/folio'
import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'

test.group('FolioService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let folioService: FolioService

  group.setup(() => {
    folioService = new FolioService()
  })

  test('createMainFolio - should create a root folio for a user', async ({ assert }) => {
    const userId = '123'

    const folio = await folioService.createMainFolio(userId)

    assert.exists(folio)
    assert.equal(folio.userId, userId)
    assert.equal(folio.name, 'root')
    assert.isNull(folio.image)
    assert.isTrue(folio.isRoot)

    const savedFolio = await Folio.query().where({ userId, isRoot: true }).first()
    assert.exists(savedFolio)
    assert.equal(savedFolio!.id, folio.id)
  })

  test('createMainFolio - should throw DuplicateEntryException when root folio already exists', async ({
    assert,
  }) => {
    const userId = '123'

    await FolioFactory.merge({
      userId,
      isRoot: true,
      name: 'Existing Root Folio',
    }).create()

    await assert.rejects(
      () => folioService.createMainFolio(userId),
      'User already has a root folio'
    )

    const rootFolios = await Folio.query().where({ userId, isRoot: true }).count('* as count')
    assert.equal(rootFolios[0].$extras.count, 1)
  })

  test('getMainFolioByUserId - should return the root folio for a user', async ({ assert }) => {
    const userId = TEST_AUTH_USER_ID

    const rootFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    await FolioFactory.merge({
      userId,
      name: 'Secondary Collection',
      isRoot: false,
    }).create()

    const result = await folioService.getMainFolioByUserId(userId)

    assert.exists(result)
    assert.equal(result.id, rootFolio.id)
    assert.equal(result.userId, userId)
    assert.equal(result.name, 'root')
    assert.equal(result.isRoot, 1)
  })

  test('getMainFolioByUserId - should throw error when user has no root folio', async ({
    assert,
  }) => {
    const userId = 'user-without-root-folio'

    await FolioFactory.merge({
      userId,
      name: 'Non-Root Collection',
      isRoot: false,
    }).create()

    await assert.rejects(
      async () => await folioService.getMainFolioByUserId(userId),
      'Row not found'
    )
  })
})
