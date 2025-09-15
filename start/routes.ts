import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const HealthCheckController = () => import('#controllers/system/health_check_controller')
const RootController = () => import('#controllers/system/root_controller')
const ApiInfoController = () => import('#controllers/system/api_info_controller')
const MeController = () => import('#controllers/product/me_controller')
const CardsController = () => import('#controllers/product/cards_controller')
const ScanController = () => import('#controllers/product/scan_controller')
const ChildFoliosController = () => import('#controllers/product/child_folios_controller')
const MainFoliosController = () => import('#controllers/product/main_folios_controller')
const SetsController = () => import('#controllers/product/sets_controller')
const FiltersController = () => import('#controllers/product/filters_controller')
const CardConditionsController = () => import('#controllers/product/card_conditions_controller')
const CardFinishesController = () => import('#controllers/product/card_finishes_controller')
const PaymentController = () => import('#controllers/product/payment_controller')
const UsersController = () => import('#controllers/product/users_controller')
const AdsController = () => import('#controllers/product/ads_controller')

router.get('/', [RootController])
router.get('/health', [HealthCheckController])

router
  .group(() => {
    router
      .group(() => {
        router.get('/', [ApiInfoController])
        router
          .group(() => {
            router.post('/init', [MeController, 'store']).use(middleware.auth())
            router.get('/', [MeController, 'show']).use(middleware.auth())
            router.patch('/', [MeController, 'update']).use(middleware.auth())
            router.get('/stripe', [MeController, 'hasStripeAccount']).use(middleware.auth())
          })
          .prefix('me')
        router
          .group(() => {
            router.get('/', [UsersController, 'search']).use(middleware.auth())
            router.get('/:id', [UsersController, 'show']).use(middleware.auth())
          })
          .prefix('/users')
        router
          .group(() => {
            router.get('/', [CardsController, 'index']).use(middleware.auth())
            router.get('/conditions', [CardConditionsController, 'index']).use(middleware.auth())
            router.get('/finishes', [CardFinishesController, 'index']).use(middleware.auth())
            router.get('/:id', [CardsController, 'show']).use(middleware.auth())
            router.get('/:id/details', [CardsController, 'details'])
            router.get('/:id/prices', [CardsController, 'prices'])
            router.get('/:id/advices', [CardsController, 'advices'])
          })
          .prefix('cards')
        router
          .group(() => {
            router.get('/', [ChildFoliosController, 'index']).use(middleware.auth())
            router.get('/cards', [MainFoliosController, 'cards']).use(middleware.auth())
            router.get('/statistics', [MainFoliosController, 'statistics']).use(middleware.auth())
            router.get('/:id', [ChildFoliosController, 'show']).use(middleware.auth())
            router.get('/:id/cards', [ChildFoliosController, 'cards']).use(middleware.auth())
            router.post('/', [ChildFoliosController, 'store']).use(middleware.auth())
            router.post('/cards', [MainFoliosController, 'collect']).use(middleware.auth())
            router
              .patch('/cards/:id', [MainFoliosController, 'updateOccurrence'])
              .use(middleware.auth())
            router.delete('/cards/:id', [MainFoliosController, 'removeCard']).use(middleware.auth())
          })
          .prefix('folios')
        router
          .group(() => {
            router.get('/', [SetsController, 'index']).use(middleware.auth())
            router.get('/:id/details', [SetsController, 'details']).use(middleware.auth())
            router.get('/:id/cards', [SetsController, 'cards']).use(middleware.auth())
          })
          .prefix('sets')
        router
          .group(() => {
            router.post('/', [AdsController, 'store']).use(middleware.auth())
            router.get('/', [AdsController, 'index']).use(middleware.auth())
            router.get('/search', [AdsController, 'search']).use(middleware.auth())
            router.get('/:id', [AdsController, 'show']).use(middleware.auth())
          })
          .prefix('ads')
        router
          .group(() => {
            router.get('/cards', [FiltersController, 'cards'])
          })
          .prefix('filters')
        router
          .group(() => {
            router.get('/account/', [PaymentController, 'createAccount']).use(middleware.auth())
            router
              .get('/:id/sheet/', [PaymentController, 'createPaymentSheet'])
              .use(middleware.auth())
            router
              .get('/publishablekey/', [PaymentController, 'getPublishableKey'])
              .use(middleware.auth())
            router.get('/account/success', [PaymentController, 'stripeAccountLinkSuccess'])
            router.get('/account/refresh', [PaymentController, 'stripeAccountLinkRefresh'])
            router.post('/webhook/', [PaymentController, 'stripeWebhook'])
          })
          .prefix('payment')
        router
          .group(() => {
            router.post('/analyze', [ScanController, 'analyze'])
            router.post('/identify', [ScanController, 'identify'])
            router.post('/grade', [ScanController, 'grade']).use(middleware.auth())
          })
          .prefix('scan')
      })
      .prefix('v1')
  })
  .prefix('api')
