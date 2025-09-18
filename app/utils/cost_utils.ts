import { CostsReview } from '#types/cost_type'

export default class CostUtils {
  public static readonly SHIPPING_COSTS = 3.99
  public static readonly SERVICE_COSTS_PERCENT = 8

  public static calculateServiceCosts(price: number): number {
    return Number(price) * (this.SERVICE_COSTS_PERCENT / 100)
  }

  public static calculateTotalCosts(price: number): number {
    return this.calculateServiceCosts(price) + this.SHIPPING_COSTS + Number(price)
  }

  public static getCostsReview(price: number): CostsReview {
    const serviceCosts = this.calculateServiceCosts(price)
    const shippingCosts = this.SHIPPING_COSTS
    const totalCosts = this.calculateTotalCosts(price)
    return {
      shippingCosts: Number(shippingCosts.toFixed(2)),
      serviceCosts: Number(serviceCosts.toFixed(2)),
      totalCosts: Number(totalCosts.toFixed(2)),
    }
  }
}
