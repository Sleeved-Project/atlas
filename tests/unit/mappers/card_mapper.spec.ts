import { test } from '@japa/runner'
import CardMapper from '#mappers/card_mapper'
import { CardFactory } from '#database/factories/card'
import testUtils from '@adonisjs/core/services/test_utils'
import Card from '#models/card'

test.group('CardMapper', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('toCardPricesOutputDTO - should map card with complete price data', async ({ assert }) => {
    const card = await CardFactory.merge({ id: 'base1-0' })
      .with('cardMarketPrices', 1, (cardMarketPrices) =>
        cardMarketPrices.merge({
          id: 1234567890,
          url: 'https://cardmarket.com/base1-0',
          trendPrice: 10.5,
          reverseHoloTrend: 15.75,
          cardId: 'base1-0',
        })
      )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({
            id: 1234567890,
            url: 'https://tcgplayer.com/base1-0',
            cardId: 'base1-0',
          })
          .with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge([
              { id: 1234567890, type: 'normal', market: 10.5 },
              { id: 1234567891, type: 'holofoil', market: 15.75 },
            ])
          )
      )
      .create()

    const result = CardMapper.toCardPricesOutputDTO(card)

    assert.equal(result.id, 'base1-0')

    assert.equal(result.cardMarketReporting?.id, 1234567890)
    assert.equal(result.cardMarketReporting?.url, 'https://cardmarket.com/base1-0')
    assert.equal(result.cardMarketReporting?.cardMarketPrices.length, 2)

    assert.equal(result.cardMarketReporting?.cardMarketPrices[0].id, 1234567890)
    assert.equal(result.cardMarketReporting?.cardMarketPrices[0].type, 'normal')
    assert.equal(result.cardMarketReporting?.cardMarketPrices[0].market, '10.5')

    assert.equal(result.cardMarketReporting?.cardMarketPrices[1].id, 1234567890)
    assert.equal(result.cardMarketReporting?.cardMarketPrices[1].type, 'reverseHolo')
    assert.equal(result.cardMarketReporting?.cardMarketPrices[1].market, '15.75')

    assert.equal(result.tcgPlayerReporting?.id, 1234567890)
    assert.equal(result.tcgPlayerReporting?.url, 'https://tcgplayer.com/base1-0')
    assert.isArray(result.tcgPlayerReporting?.tcgPlayerPrices)
    assert.equal(result.tcgPlayerReporting?.tcgPlayerPrices.length, 2)
  })

  test('toCardPricesOutputDTO - should handle missing CardMarket prices', async ({ assert }) => {
    const card = await CardFactory.merge({ id: 'base1-0' })
      .with('cardMarketPrices', 1, (cardMarketPrices) =>
        cardMarketPrices.merge({
          id: 1234567890,
          url: 'https://cardmarket.com/base1-0',
          trendPrice: null,
          reverseHoloTrend: null,
          cardId: 'base1-0',
        })
      )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({
            id: 1234567890,
            url: 'https://tcgplayer.com/base1-0',
            cardId: 'base1-0',
          })
          .with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge([
              { id: 1234567890, type: 'normal', market: 10.5 },
              { id: 1234567891, type: 'holofoil', market: 15.75 },
            ])
          )
      )
      .create()

    const result = CardMapper.toCardPricesOutputDTO(card)

    assert.equal(result.id, 'base1-0')
    assert.isNotNull(result.cardMarketReporting)

    assert.equal(result.cardMarketReporting?.cardMarketPrices[0].id, 1234567890)
    assert.equal(result.cardMarketReporting?.cardMarketPrices[0].type, 'normal')
    assert.isNull(result.cardMarketReporting?.cardMarketPrices[0].market)

    assert.equal(result.cardMarketReporting?.cardMarketPrices[1].id, 1234567890)
    assert.equal(result.cardMarketReporting?.cardMarketPrices[1].type, 'reverseHolo')
    assert.isNull(result.cardMarketReporting?.cardMarketPrices[1].market)

    assert.equal(result.tcgPlayerReporting?.id, 1234567890)
    assert.equal(result.tcgPlayerReporting?.url, 'https://tcgplayer.com/base1-0')
    assert.isArray(result.tcgPlayerReporting?.tcgPlayerPrices)
    assert.equal(result.tcgPlayerReporting?.tcgPlayerPrices.length, 2)
  })

  test('toCardPricesOutputDTO - should handle empty card price data', async ({ assert }) => {
    const mockCard = {
      id: 'base1-0',
      cardMarketPrices: [],
      tcgPlayerReportings: [],
    } as unknown as Card

    const result = CardMapper.toCardPricesOutputDTO(mockCard)

    assert.equal(result.id, 'base1-0')
    assert.isNull(result.cardMarketReporting)
    assert.isNull(result.tcgPlayerReporting)
  })
})
