import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { SetFactory } from '#database/factories/set'
import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { FolioFactory } from '#database/factories/folio'
import { CardFolioFactory } from '#database/factories/card_folio'
import { CardFactory } from '#database/factories/card'
import SetProcessor from '../../../app/processors/set_processor.js'
import CardService from '#services/card_service'
import Set from '#models/set'
import { LegalityFactory } from '#database/factories/legality'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'

test.group('SetProcessor', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let setProcessor: SetProcessor
  let cardService: CardService

  group.setup(() => {
    cardService = new CardService()
    setProcessor = new SetProcessor(cardService)
  })

  test('processPaginatedSetCardsToBasicSetOuputDTO should return paginated basic Sets', async ({
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    const sets = await SetFactory.createMany(15)
    const rootFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()
    const card1 = await CardFactory.merge({ setId: sets[0].id }).create()
    const card2 = await CardFactory.merge({ setId: sets[1].id }).create()
    const card3 = await CardFactory.merge({ setId: sets[2].id }).create()

    await CardFolioFactory.merge({
      cardId: card1.id,
      folioId: rootFolio.id,
      occurrence: 22,
    }).create()

    await CardFolioFactory.merge({
      cardId: card2.id,
      folioId: rootFolio.id,
      occurrence: 1,
    }).create()

    await CardFolioFactory.merge({
      cardId: card3.id,
      folioId: rootFolio.id,
      occurrence: 3,
    }).create()

    const paginatedSets = await Set.query()
      .select('id', 'imageSymbol', 'imageLogo', 'total')
      .paginate(1, 10)

    const basicSets = await setProcessor.processPaginatedSetCardsToBasicSetOuputDTO(
      paginatedSets,
      userId
    )

    assert.properties(basicSets, ['data', 'meta'])
    assert.properties(basicSets.data[0], ['id', 'imageSymbol', 'imageLogo', 'nbOwned', 'total'])
  })
})
