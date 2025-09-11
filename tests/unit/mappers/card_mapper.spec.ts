import { test } from '@japa/runner'
import sinon from 'sinon'
import CardMapper from '#mappers/card_mapper'
import Card from '#models/card'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'
import TcgPlayerPrice from '#models/tcg_player_price'
import { ScanCardInfoDTO } from '#types/iris_type'
import { HasMany } from '@adonisjs/lucid/types/relations'

test.group('CardMapper', (group) => {
  let sandbox: sinon.SinonSandbox

  group.each.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('toCardPricesOutputDTO - should throw an error if the card is null', ({ assert }) => {
    assert.throws(
      () => CardMapper.toCardPricesOutputDTO(null as unknown as Card),
      'Card cannot be null'
    )
  })

  test('toCardPricesOutputDTO - should return a correctly formatted DTO', ({ assert }) => {
    const cardMarketPrice = new CardMarketPrice()
    cardMarketPrice.id = 1
    cardMarketPrice.url = 'https://cardmarket.com/card/1'
    cardMarketPrice.trendPrice = 10.5
    cardMarketPrice.reverseHoloTrend = 15.75

    const tcgPlayerPrice1 = new TcgPlayerPrice()
    tcgPlayerPrice1.id = 1
    tcgPlayerPrice1.type = 'normal'
    tcgPlayerPrice1.market = 12.25

    const tcgPlayerPrice2 = new TcgPlayerPrice()
    tcgPlayerPrice2.id = 2
    tcgPlayerPrice2.type = 'holofoil'
    tcgPlayerPrice2.market = 18.99

    const tcgPlayerReporting = new TcgPlayerReporting()
    tcgPlayerReporting.id = 1
    tcgPlayerReporting.url = 'https://tcgplayer.com/card/1'
    tcgPlayerReporting.tcgPlayerPrices = [tcgPlayerPrice1, tcgPlayerPrice2] as HasMany<
      typeof TcgPlayerPrice
    >

    const card = new Card()
    card.id = '1'
    card.cardMarketPrices = [cardMarketPrice] as HasMany<typeof CardMarketPrice>
    card.tcgPlayerReportings = [tcgPlayerReporting] as HasMany<typeof TcgPlayerReporting>

    const result = CardMapper.toCardPricesOutputDTO(card)

    assert.equal(result.id, '1')

    assert.isNotNull(result.cardMarketReporting)
    assert.equal(result.cardMarketReporting!.id, '1')
    assert.equal(result.cardMarketReporting!.url, 'https://cardmarket.com/card/1')
    assert.equal(result.cardMarketReporting!.cardMarketPrices.length, 2)
    assert.equal(result.cardMarketReporting!.cardMarketPrices[0].type, 'normal')
    assert.equal(result.cardMarketReporting!.cardMarketPrices[0].market, '10.5')
    assert.equal(result.cardMarketReporting!.cardMarketPrices[1].type, 'reverseHolo')
    assert.equal(result.cardMarketReporting!.cardMarketPrices[1].market, '15.75')

    assert.isNotNull(result.tcgPlayerReporting)
    assert.equal(result.tcgPlayerReporting!.id, '1')
    assert.equal(result.tcgPlayerReporting!.url, 'https://tcgplayer.com/card/1')
    assert.equal(result.tcgPlayerReporting!.tcgPlayerPrices.length, 2)
    assert.equal(result.tcgPlayerReporting!.tcgPlayerPrices[0].type, 'normal')
    assert.equal(result.tcgPlayerReporting!.tcgPlayerPrices[0].market, '12.25')
    assert.equal(result.tcgPlayerReporting!.tcgPlayerPrices[1].type, 'holofoil')
    assert.equal(result.tcgPlayerReporting!.tcgPlayerPrices[1].market, '18.99')
  })

  test('toCardPricesOutputDTO - should handle the case where cardMarketPrices or tcgPlayerReportings is empty', ({
    assert,
  }) => {
    const card = new Card()
    card.id = '1'
    card.cardMarketPrices = [] as unknown as HasMany<typeof CardMarketPrice>
    card.tcgPlayerReportings = [] as unknown as HasMany<typeof TcgPlayerReporting>

    const result = CardMapper.toCardPricesOutputDTO(card)

    assert.equal(result.id, '1')
    assert.isNull(result.cardMarketReporting)
    assert.isNull(result.tcgPlayerReporting)
  })

  test('toCardScanResultOutputDTO - should return a correctly formatted DTO', ({ assert }) => {
    const card = new Card()
    card.id = '1'
    card.imageSmall = 'small.jpg'
    card.imageLarge = 'large.jpg'

    const getBestPriceStub = sandbox.stub(CardMapper, 'getBestPriceFromCardScanResultInfos')
    getBestPriceStub.returns('15.75')

    const scanCardInfo: ScanCardInfoDTO = {
      id: '1',
      similarity: 95,
    }

    const result = CardMapper.toCardScanResultOutputDTO(card, scanCardInfo)

    assert.equal(result.id, '1')
    assert.equal(result.imageSmall, 'small.jpg')
    assert.equal(result.imageLarge, 'large.jpg')
    assert.equal(result.bestTrendPrice, '15.75')
    assert.equal(result.similarity, 95)

    sinon.assert.calledOnceWithExactly(getBestPriceStub, card)
  })

  test('getBestPriceFromCardScanResultInfos - should return "unknown" if the card is null', ({
    assert,
  }) => {
    const getBestPrice = Reflect.get(CardMapper, 'getBestPriceFromCardScanResultInfos').bind(
      CardMapper
    )
    const card = null as unknown as Card
    assert.equal(getBestPrice(card), 'unknown')
  })

  test('getBestPriceFromCardScanResultInfos - should return "unknown" if cardMarketPrices and tcgPlayerReportings are empty', ({
    assert,
  }) => {
    const getBestPrice = Reflect.get(CardMapper, 'getBestPriceFromCardScanResultInfos').bind(
      CardMapper
    )

    const card = new Card()
    card.id = '1'
    card.cardMarketPrices = [] as unknown as HasMany<typeof CardMarketPrice>
    card.tcgPlayerReportings = [] as unknown as HasMany<typeof TcgPlayerReporting>

    assert.equal(getBestPrice(card), 'unknown')
  })

  test('getBestPriceFromCardScanResultInfos - should return the best price between CardMarket and TCGPlayer', ({
    assert,
  }) => {
    const getBestPrice = Reflect.get(CardMapper, 'getBestPriceFromCardScanResultInfos').bind(
      CardMapper
    )

    const getBestCardMarketPriceStub = sandbox.stub(CardMapper, 'getBestCardMarketPrice')
    const getBestTcgPlayerReportingPriceStub = sandbox.stub(
      CardMapper,
      'getBestTcgPlayerReportingPrice'
    )

    getBestCardMarketPriceStub.returns(10.5)
    getBestTcgPlayerReportingPriceStub.returns(15.75)

    const card = new Card()
    card.id = '1'
    card.cardMarketPrices = [new CardMarketPrice()] as HasMany<typeof CardMarketPrice>
    card.tcgPlayerReportings = [new TcgPlayerReporting()] as HasMany<typeof TcgPlayerReporting>

    assert.equal(getBestPrice(card), '15.75')
  })

  test('getBestCardMarketPrice - should return 0 if prices are null', ({ assert }) => {
    const getBestCardMarketPrice = Reflect.get(CardMapper, 'getBestCardMarketPrice').bind(
      CardMapper
    )

    assert.equal(getBestCardMarketPrice(null), 0)
  })

  test('getBestCardMarketPrice - should return the best price between normal and reverseHolo', ({
    assert,
  }) => {
    const getBestCardMarketPrice = Reflect.get(CardMapper, 'getBestCardMarketPrice').bind(
      CardMapper
    )

    const cardMarketPrice = new CardMarketPrice()
    cardMarketPrice.trendPrice = 10.5
    cardMarketPrice.reverseHoloTrend = 15.75

    assert.equal(getBestCardMarketPrice(cardMarketPrice), 15.75)

    cardMarketPrice.trendPrice = 20
    cardMarketPrice.reverseHoloTrend = 15.75

    assert.equal(getBestCardMarketPrice(cardMarketPrice), 20)
  })

  test('getBestTcgPlayerReportingPrice - should return 0 if prices are null or empty', ({
    assert,
  }) => {
    const getBestTcgPlayerReportingPrice = Reflect.get(
      CardMapper,
      'getBestTcgPlayerReportingPrice'
    ).bind(CardMapper)

    assert.equal(getBestTcgPlayerReportingPrice(null), 0)

    const tcgPlayerReporting = new TcgPlayerReporting()
    tcgPlayerReporting.tcgPlayerPrices = [] as unknown as HasMany<typeof TcgPlayerPrice>

    assert.equal(getBestTcgPlayerReportingPrice(tcgPlayerReporting), 0)
  })

  test('getBestTcgPlayerReportingPrice - should return the highest price', ({ assert }) => {
    const getBestTcgPlayerReportingPrice = Reflect.get(
      CardMapper,
      'getBestTcgPlayerReportingPrice'
    ).bind(CardMapper)

    const tcgPlayerPrice1 = new TcgPlayerPrice()
    tcgPlayerPrice1.market = 10.5

    const tcgPlayerPrice2 = new TcgPlayerPrice()
    tcgPlayerPrice2.market = 15.75

    const tcgPlayerPrice3 = new TcgPlayerPrice()
    tcgPlayerPrice3.market = 12.25

    const tcgPlayerReporting = new TcgPlayerReporting()
    tcgPlayerReporting.tcgPlayerPrices = [
      tcgPlayerPrice1,
      tcgPlayerPrice2,
      tcgPlayerPrice3,
    ] as HasMany<typeof TcgPlayerPrice>

    assert.equal(getBestTcgPlayerReportingPrice(tcgPlayerReporting), 15.75)
  })

  test('toCardBaseOuputDTO - should return correct format with occurrence from cardFolios', ({
    assert,
  }) => {
    const mockSet = {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    }

    const mockCardFolio = {
      occurrence: 3,
    }

    const card = new Card()
    const toJSONStub = sandbox.stub(card, 'toJSON')
    toJSONStub.returns({
      id: 'base1-17',
      imageLarge: 'https://images.pokemontcg.io/base1/17_hires.png',
      number: '17',
      cardFolios: [mockCardFolio],
      set: mockSet,
    })

    const result = CardMapper.toCardBaseOuputDTO(card)

    assert.equal(result.id, 'base1-17')
    assert.equal(result.imageLarge, 'https://images.pokemontcg.io/base1/17_hires.png')
    assert.equal(result.number, '17')
    assert.equal(result.occurrence, 3)
    assert.deepEqual(result.set, {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    })

    sinon.assert.calledOnce(toJSONStub)
  })

  test('toCardBaseOuputDTO - should return occurrence 0 when cardFolios is empty', ({ assert }) => {
    const mockSet = {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    }

    const card = new Card()
    const toJSONStub = sandbox.stub(card, 'toJSON')
    toJSONStub.returns({
      id: 'base1-18',
      imageLarge: 'https://images.pokemontcg.io/base1/18_hires.png',
      number: '18',
      cardFolios: [],
      set: mockSet,
    })

    const result = CardMapper.toCardBaseOuputDTO(card)

    assert.equal(result.id, 'base1-18')
    assert.equal(result.imageLarge, 'https://images.pokemontcg.io/base1/18_hires.png')
    assert.equal(result.number, '18')
    assert.equal(result.occurrence, 0)
    assert.deepEqual(result.set, {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    })
  })

  test('toCardBaseOuputDTO - should return occurrence 0 when cardFolios is null', ({ assert }) => {
    const mockSet = {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    }

    const card = new Card()
    const toJSONStub = sandbox.stub(card, 'toJSON')
    toJSONStub.returns({
      id: 'base1-19',
      imageLarge: 'https://images.pokemontcg.io/base1/19_hires.png',
      number: '19',
      cardFolios: null,
      set: mockSet,
    })

    const result = CardMapper.toCardBaseOuputDTO(card)

    assert.equal(result.id, 'base1-19')
    assert.equal(result.imageLarge, 'https://images.pokemontcg.io/base1/19_hires.png')
    assert.equal(result.number, '19')
    assert.equal(result.occurrence, 0)
    assert.deepEqual(result.set, {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    })
  })

  test('toCardBaseOuputDTO - should return occurrence 0 when cardFolios is undefined', ({
    assert,
  }) => {
    const mockSet = {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    }

    const card = new Card()
    const toJSONStub = sandbox.stub(card, 'toJSON')
    toJSONStub.returns({
      id: 'base1-20',
      imageLarge: 'https://images.pokemontcg.io/base1/20_hires.png',
      number: '20',
      set: mockSet,
    })

    const result = CardMapper.toCardBaseOuputDTO(card)

    assert.equal(result.id, 'base1-20')
    assert.equal(result.imageLarge, 'https://images.pokemontcg.io/base1/20_hires.png')
    assert.equal(result.number, '20')
    assert.equal(result.occurrence, 0)
    assert.deepEqual(result.set, {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    })
  })

  test('toCardBaseOuputDTO - should use occurrence from first cardFolio when multiple exist', ({
    assert,
  }) => {
    const mockSet = {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    }

    const mockCardFolios = [{ occurrence: 5 }, { occurrence: 2 }, { occurrence: 8 }]

    const card = new Card()
    const toJSONStub = sandbox.stub(card, 'toJSON')
    toJSONStub.returns({
      id: 'base1-21',
      imageLarge: 'https://images.pokemontcg.io/base1/21_hires.png',
      number: '21',
      cardFolios: mockCardFolios,
      set: mockSet,
    })

    const result = CardMapper.toCardBaseOuputDTO(card)

    assert.equal(result.id, 'base1-21')
    assert.equal(result.imageLarge, 'https://images.pokemontcg.io/base1/21_hires.png')
    assert.equal(result.number, '21')
    assert.equal(result.occurrence, 5)
    assert.deepEqual(result.set, {
      id: 'base1',
      name: 'Base',
      imageSymbol: 'https://images.pokemontcg.io/base1/symbol.png',
    })
  })

  test('toCardBaseOuputDTO - should handle all required fields correctly', ({ assert }) => {
    const mockSet = {
      id: 'xy1',
      name: 'XY Base Set',
      imageSymbol: 'https://images.pokemontcg.io/xy1/symbol.png',
    }

    const mockCardFolio = {
      occurrence: 1,
    }

    const card = new Card()
    const toJSONStub = sandbox.stub(card, 'toJSON')
    toJSONStub.returns({
      id: 'xy1-150',
      imageLarge: 'https://images.pokemontcg.io/xy1/150_hires.png',
      number: '150',
      cardFolios: [mockCardFolio],
      set: mockSet,
      name: 'Mewtwo',
      hp: '130',
      supertype: 'Pokémon',
    })

    const result = CardMapper.toCardBaseOuputDTO(card)

    const expectedKeys = ['id', 'imageLarge', 'number', 'occurrence', 'set']
    const actualKeys = Object.keys(result)

    assert.sameMembers(actualKeys, expectedKeys)

    assert.equal(result.id, 'xy1-150')
    assert.equal(result.imageLarge, 'https://images.pokemontcg.io/xy1/150_hires.png')
    assert.equal(result.number, '150')
    assert.equal(result.occurrence, 1)

    assert.properties(result.set, ['id', 'name', 'imageSymbol'])
    assert.equal(result.set.id, 'xy1')
    assert.equal(result.set.name, 'XY Base Set')
    assert.equal(result.set.imageSymbol, 'https://images.pokemontcg.io/xy1/symbol.png')
  })
})
