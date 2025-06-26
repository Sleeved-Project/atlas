import { test } from '@japa/runner'
import CardFolioService from '#services/card_folio_service'
import testUtils from '@adonisjs/core/services/test_utils'
import CardFolio from '#models/card_folio'
import { CardFactory } from '#database/factories/card'
import { FolioFactory } from '#database/factories/folio'
import { v4 as uuidv4 } from 'uuid'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'

test.group('CardFolioService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let cardFolioService: CardFolioService

  group.setup(() => {
    cardFolioService = new CardFolioService()
  })

  test('createCardFolio - should create a card folio relationship with occurrence 1', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const card = await CardFactory.create()
    const folio = await FolioFactory.create()

    const cardFolio = await cardFolioService.createCardFolio(card.id, folio.id)

    assert.exists(cardFolio)
    assert.isNotNull(cardFolio.id)
    assert.equal(cardFolio.cardId, card.id)
    assert.equal(cardFolio.folioId, folio.id)
    assert.equal(cardFolio.occurrence, 1)

    const savedCardFolio = await CardFolio.query()
      .where('card_id', card.id)
      .where('folio_id', folio.id)
      .first()

    assert.exists(savedCardFolio)
    assert.equal(savedCardFolio?.id, cardFolio.id)
  })

  test('createCardFolio - should throw error when card does not exist', async ({ assert }) => {
    const nonExistentCardId = 'non-existent-card'
    const folio = await FolioFactory.create()

    await assert.rejects(
      async () => await cardFolioService.createCardFolio(nonExistentCardId, folio.id)
    )
  })

  test('createCardFolio - should throw error when folio does not exist', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const card = await CardFactory.create()
    const nonExistentFolioId = uuidv4()

    await assert.rejects(
      async () => await cardFolioService.createCardFolio(card.id, nonExistentFolioId)
    )
  })

  test('createCardFolio - should throw unique constraint error for duplicate entry', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const card = await CardFactory.create()
    const folio = await FolioFactory.create()

    await cardFolioService.createCardFolio(card.id, folio.id)

    await assert.rejects(async () => await cardFolioService.createCardFolio(card.id, folio.id))
  })
})
