import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const HealthCheckController = () => import('#controllers/system/health_check_controller')
const RootController = () => import('#controllers/system/root_controller')
const ApiInfoController = () => import('#controllers/system/api_info_controller')
const UserController = () => import('#controllers/product/user_controller')
const CardsController = () => import('#controllers/product/cards_controller')
const ScanController = () => import('#controllers/product/scan_controller')
const ChildFoliosController = () => import('#controllers/product/child_folios_controller')
const MainFoliosController = () => import('#controllers/product/main_folios_controller')
const SetsController = () => import('#controllers/product/sets_controller')
const FiltersController = () => import('#controllers/product/filters_controller')
const CardConditionsController = () => import('#controllers/product/card_conditions_controller')
const CardFinishesController = () => import('#controllers/product/card_finishes_controller')

router.get('/', [RootController])
router.get('/health', [HealthCheckController])

router
  .group(() => {
    router
      .group(() => {
        router.get('/', [ApiInfoController])
        router
          .group(() => {
            router.post('/init', [UserController, 'store']).use(middleware.auth())
            router.get('/:id', [UserController, 'show']).use(middleware.auth())
          })
          .prefix('user')
        router
          .group(() => {
            router.get('/', [CardsController, 'index']).use(middleware.auth())
            router.get('/conditions', [CardConditionsController, 'index']).use(middleware.auth())
            router.get('/finishes', [CardFinishesController, 'index']).use(middleware.auth())
            router.get('/:id', [CardsController, 'show']).use(middleware.auth())
            router.get('/:id/details', [CardsController, 'details'])
            router.get('/:id/prices', [CardsController, 'prices'])
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
            router.get('/cards', [FiltersController, 'cards'])
          })
          .prefix('filters')
        router.post('/scan/analyze', [ScanController, 'analyze'])
      })
      .prefix('v1')
  })
  .prefix('api')
