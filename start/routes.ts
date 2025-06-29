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
        router.get('/cards', [CardsController, 'index']).use(middleware.auth())
        router.get('/cards/rarity', [CardsController, 'rarity'])
        router.get('/cards/subtype', [CardsController, 'subtype'])
        router.get('/cards/artist', [CardsController, 'artist'])
        router.get('/cards/:id', [CardsController, 'show'])
        router.get('/cards/:id/details', [CardsController, 'details'])
        router.get('/cards/:id/prices', [CardsController, 'prices'])
        router.post('/scan/analyze', [ScanController, 'analyze'])
        router.post('/folios/init', [FoliosController, 'init']).use(middleware.auth())
        router.get('/folios/cards', [FoliosController, 'cards']).use(middleware.auth())
        router
          .post('/folios/cards/collect', [CardFoliosController, 'collect'])
          .use(middleware.auth())
        router
          .patch('/folios/cards/:id/occurrence', [CardFoliosController, 'occurrence'])
          .use(middleware.auth())
        router.get('/folios/statistics', [FoliosController, 'statistics']).use(middleware.auth())
        router
          .delete('/folios/cards/:id/remove', [CardFoliosController, 'delete'])
          .use(middleware.auth())
      })
      .prefix('v1')
  })
  .prefix('api')
