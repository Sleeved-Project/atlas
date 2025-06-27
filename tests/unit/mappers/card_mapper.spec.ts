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

  test('formatPriceValue - should return "unknown" for null or zero values', ({ assert }) => {
    // On utilise Reflect pour accéder à la méthode privée
    const formatPriceValue = Reflect.get(CardMapper, 'formatPriceValue').bind(CardMapper)

    assert.equal(formatPriceValue(null), 'unknown')
    assert.equal(formatPriceValue('0.00'), 'unknown')
    assert.equal(formatPriceValue(0), 'unknown')
    assert.equal(formatPriceValue('0'), 'unknown')
  })

  test('formatPriceValue - should convert non-null values to string', ({ assert }) => {
    // On utilise Reflect pour accéder à la méthode privée
    const formatPriceValue = Reflect.get(CardMapper, 'formatPriceValue').bind(CardMapper)

    assert.equal(formatPriceValue(10), '10')
    assert.equal(formatPriceValue('10.50'), '10.50')
    assert.equal(formatPriceValue(15.75), '15.75')
  })

  test('toCardPricesOutputDTO - should throw an error if the card is null', ({ assert }) => {
    assert.throws(
      () => CardMapper.toCardPricesOutputDTO(null as unknown as Card),
      'Card cannot be null'
    )
  })

  test('toCardPricesOutputDTO - should return a correctly formatted DTO', ({ assert }) => {
    // Création d'un mock de CardMarketPrice
    const cardMarketPrice = new CardMarketPrice()
    cardMarketPrice.id = 1
    cardMarketPrice.url = 'https://cardmarket.com/card/1'
    cardMarketPrice.trendPrice = 10.5
    cardMarketPrice.reverseHoloTrend = 15.75

    // Création d'un mock de TcgPlayerPrice
    const tcgPlayerPrice1 = new TcgPlayerPrice()
    tcgPlayerPrice1.id = 1
    tcgPlayerPrice1.type = 'normal'
    tcgPlayerPrice1.market = 12.25

    const tcgPlayerPrice2 = new TcgPlayerPrice()
    tcgPlayerPrice2.id = 2
    tcgPlayerPrice2.type = 'holofoil'
    tcgPlayerPrice2.market = 18.99

    // Création d'un mock de TcgPlayerReporting
    const tcgPlayerReporting = new TcgPlayerReporting()
    tcgPlayerReporting.id = 1
    tcgPlayerReporting.url = 'https://tcgplayer.com/card/1'
    tcgPlayerReporting.tcgPlayerPrices = [tcgPlayerPrice1, tcgPlayerPrice2] as HasMany<
      typeof TcgPlayerPrice
    >

    // Création d'un mock de Card
    const card = new Card()
    card.id = '1'
    card.cardMarketPrices = [cardMarketPrice] as HasMany<typeof CardMarketPrice>
    card.tcgPlayerReportings = [tcgPlayerReporting] as HasMany<typeof TcgPlayerReporting>

    const result = CardMapper.toCardPricesOutputDTO(card)

    // Assertions
    assert.equal(result.id, '1')

    // Vérification des prix CardMarket
    assert.isNotNull(result.cardMarketReporting)
    assert.equal(result.cardMarketReporting!.id, '1')
    assert.equal(result.cardMarketReporting!.url, 'https://cardmarket.com/card/1')
    assert.equal(result.cardMarketReporting!.cardMarketPrices.length, 2)
    assert.equal(result.cardMarketReporting!.cardMarketPrices[0].type, 'normal')
    assert.equal(result.cardMarketReporting!.cardMarketPrices[0].market, '10.5')
    assert.equal(result.cardMarketReporting!.cardMarketPrices[1].type, 'reverseHolo')
    assert.equal(result.cardMarketReporting!.cardMarketPrices[1].market, '15.75')

    // Vérification des prix TCGPlayer
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
    // Création d'un mock de Card sans cardMarketPrices
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
    // Création d'un mock de Card
    const card = new Card()
    card.id = '1'
    card.imageSmall = 'small.jpg'
    card.imageLarge = 'large.jpg'

    // Mock de getBestPriceFromCardScanResultInfos
    const getBestPriceStub = sandbox.stub(CardMapper, 'getBestPriceFromCardScanResultInfos')
    getBestPriceStub.returns('15.75')

    const scanCardInfo: ScanCardInfoDTO = {
      id: '1',
      similarity: 95,
    }

    const result = CardMapper.toCardScanResultOutputDTO(card, scanCardInfo)

    // Assertions
    assert.equal(result.id, '1')
    assert.equal(result.imageSmall, 'small.jpg')
    assert.equal(result.imageLarge, 'large.jpg')
    assert.equal(result.bestTrendPrice, '15.75')
    assert.equal(result.similarity, 95)

    // Vérification de l'appel de la méthode
    sinon.assert.calledOnceWithExactly(getBestPriceStub, card)
  })

  test('getBestPriceFromCardScanResultInfos - should return "unknown" if the card is null', ({
    assert,
  }) => {
    // On utilise Reflect pour accéder à la méthode protected
    const getBestPrice = Reflect.get(CardMapper, 'getBestPriceFromCardScanResultInfos').bind(
      CardMapper
    )
    const card = null as unknown as Card
    assert.equal(getBestPrice(card), 'unknown')
  })

  test('getBestPriceFromCardScanResultInfos - should return "unknown" if cardMarketPrices and tcgPlayerReportings are empty', ({
    assert,
  }) => {
    // On utilise Reflect pour accéder à la méthode protected
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
    // On utilise Reflect pour accéder aux méthodes protected
    const getBestPrice = Reflect.get(CardMapper, 'getBestPriceFromCardScanResultInfos').bind(
      CardMapper
    )

    // Mock des méthodes internes
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
    // On utilise Reflect pour accéder à la méthode protected
    const getBestCardMarketPrice = Reflect.get(CardMapper, 'getBestCardMarketPrice').bind(
      CardMapper
    )

    assert.equal(getBestCardMarketPrice(null), 0)
  })

  test('getBestCardMarketPrice - should return the best price between normal and reverseHolo', ({
    assert,
  }) => {
    // On utilise Reflect pour accéder à la méthode protected
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
    // On utilise Reflect pour accéder à la méthode protected
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
})
