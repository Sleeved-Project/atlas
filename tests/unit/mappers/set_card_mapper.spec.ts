import { test } from '@japa/runner'
import sinon from 'sinon'
import SetCardsMapper from '#mappers/set_cards_mapper'
import Card from '#models/card'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'
import TcgPlayerPrice from '#models/tcg_player_price'
import { SetCardPriceTrending } from '#types/set_type'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('SetCardsMapper', (group) => {
  let sandbox: sinon.SinonSandbox

  group.each.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('getCardMarketTrendPrice should sum trendPrice of first cardMarketPrice for each card', ({
    assert,
  }) => {
    const card1 = new Card()
    const cmp1 = new CardMarketPrice()
    cmp1.trendPrice = 10
    card1.cardMarketPrices = [cmp1] as any

    const card2 = new Card()
    const cmp2 = new CardMarketPrice()
    cmp2.trendPrice = 20
    card2.cardMarketPrices = [cmp2] as any

    const result = SetCardsMapper.getCardMarketTrendPrice([card1, card2])
    assert.equal(result, 30)
  })

  test('getLowerTcgPlayerMarketPrice should sum lowest tcgPlayerPrice.market for each card', ({
    assert,
  }) => {
    const card1 = new Card()
    const reporting1 = new TcgPlayerReporting()
    const price1a = new TcgPlayerPrice()
    price1a.market = 12
    const price1b = new TcgPlayerPrice()
    price1b.market = 8
    reporting1.tcgPlayerPrices = [price1a, price1b] as any
    card1.tcgPlayerReportings = [reporting1] as any

    const card2 = new Card()
    const reporting2 = new TcgPlayerReporting()
    const price2a = new TcgPlayerPrice()
    price2a.market = 15
    reporting2.tcgPlayerPrices = [price2a] as any
    card2.tcgPlayerReportings = [reporting2] as any

    const result = SetCardsMapper.getLowerTcgPlayerMarketPrice([card1, card2])
    assert.equal(result, 8 + 15)
  })

  test('getPriceTrend should return correct trend', ({ assert }) => {
    assert.equal(SetCardsMapper.getPriceTrend(10, 5), SetCardPriceTrending.UP)
    assert.equal(SetCardsMapper.getPriceTrend(5, 10), SetCardPriceTrending.DOWN)
    assert.equal(SetCardsMapper.getPriceTrend(10, 10), SetCardPriceTrending.EQUAL)
  })

  test('toSetStatistics should return correct statistics', ({ assert }) => {
    const card1 = new Card()
    const cmp1 = new CardMarketPrice()
    cmp1.trendPrice = 10
    card1.cardMarketPrices = [cmp1] as any
    const reporting1 = new TcgPlayerReporting()
    const price1 = new TcgPlayerPrice()
    price1.market = 5
    reporting1.tcgPlayerPrices = [price1] as any
    card1.tcgPlayerReportings = [reporting1] as any

    const card2 = new Card()
    const cmp2 = new CardMarketPrice()
    cmp2.trendPrice = 20
    card2.cardMarketPrices = [cmp2] as any
    const reporting2 = new TcgPlayerReporting()
    const price2 = new TcgPlayerPrice()
    price2.market = 15
    reporting2.tcgPlayerPrices = [price2] as any
    card2.tcgPlayerReportings = [reporting2] as any

    const stats = SetCardsMapper.toSetStatistics([card1, card2], [card1])
    assert.equal(stats.totalCardsCount, 2)
    assert.equal(stats.cardMarketPrice, '30.00')
    assert.equal(stats.tcgPlayerPrice, '20.00')
    assert.equal(stats.cardMarketTrending, SetCardPriceTrending.UP)
    assert.equal(stats.tcgPlayerTrending, SetCardPriceTrending.UP)
  })
})
