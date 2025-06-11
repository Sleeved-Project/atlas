import router from '@adonisjs/core/services/router'
const HealthCheckController = () => import('#controllers/system/health_check_controller')
const RootController = () => import('#controllers/system/root_controller')
const ApiInfoController = () => import('#controllers/system/api_info_controller')
const CardsController = () => import('#controllers/product/cards_controller')

router.get('/', [RootController])
router.get('/health', [HealthCheckController])

router
  .group(() => {
    router
      .group(() => {
        router.get('/', [ApiInfoController])
        router.get('/cards', [CardsController, 'index'])
        router.get('/cards/:id', [CardsController, 'show'])
        router.get('/cards/:id/details', [CardsController, 'details'])
        router.get('/cards/:id/prices', [CardsController, 'prices'])
      })
      .prefix('v1')
  })
  .prefix('api')
