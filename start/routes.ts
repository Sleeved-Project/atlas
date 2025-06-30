import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const HealthCheckController = () => import('#controllers/system/health_check_controller')
const RootController = () => import('#controllers/system/root_controller')
const ApiInfoController = () => import('#controllers/system/api_info_controller')
const CardsController = () => import('#controllers/product/cards_controller')
const ScanController = () => import('#controllers/product/scan_controller')
const FoliosController = () => import('#controllers/product/folios_controller')
const CardFoliosController = () => import('#controllers/product/card_folios_controller')

router.get('/', [RootController])
router.get('/health', [HealthCheckController])

router
  .group(() => {
    router
      .group(() => {
        router.get('/', [ApiInfoController])
        router
          .group(() => {
            router.get('/', [CardsController, 'index']).use(middleware.auth())
            router.get('/rarity', [CardsController, 'rarity'])
            router.get('/subtype', [CardsController, 'subtype'])
            router.get('/artist', [CardsController, 'artist'])
            router.get('/:id', [CardsController, 'show'])
            router.get('/:id/details', [CardsController, 'details'])
            router.get('/:id/prices', [CardsController, 'prices'])
          })
          .prefix('cards')
        router
          .group(() => {
            router.post('/init', [FoliosController, 'init']).use(middleware.auth())
            router.get('/cards', [FoliosController, 'cards']).use(middleware.auth())
            router.get('/statistics', [FoliosController, 'statistics']).use(middleware.auth())
            router.post('/cards', [CardFoliosController, 'collect']).use(middleware.auth())
            router.patch('/cards/:id', [CardFoliosController, 'occurrence']).use(middleware.auth())
            router.delete('/cards/:id', [CardFoliosController, 'delete']).use(middleware.auth())
          })
          .prefix('folios')
        router.post('/scan/analyze', [ScanController, 'analyze'])
      })
      .prefix('v1')
  })
  .prefix('api')
