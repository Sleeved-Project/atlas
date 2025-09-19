import OrderStatus from '#models/order_status'
import Factory from '@adonisjs/lucid/factories'

export const OrderStatusFactory = Factory.define(OrderStatus, ({ faker }) => {
  return {
    id: faker.number.int({ min: 1, max: 100 }),
    label: faker.helpers.arrayElement([
      'Pending Delivery',
      'Published',
      'Sold',
      'Cancelled',
      'Expired',
    ]),
  }
})
  .state('pending', (status) => {
    status.id = 1
    status.label = 'Pending Delivery'
  })
  .build()
