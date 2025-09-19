export enum OrderStatusEnum {
  PENDING_DELIVERY = 1,
  SENT = 2,
  DELIVERED = 3,
  CANCELED = 4,
}

interface OrderDetailsAddressOuputDTO {
  id: string
  road: string
  additionalInfo: string | null
  zipcode: string
  city: string
  country: string
  countrycode: string
}

export interface OrderDetailsOutputDTO {
  ad: {
    rectoImageUrl: string
    originalPrice: string
    finish: { label: string }
    condition: { label: string }
    seller: { id: string; username: string; profilePictureUrl: string }
    card: { name: string }
    certificate: {
      grade: { label: string }
      globalRating: string
    } | null
  }
  addresses: {
    delivery: OrderDetailsAddressOuputDTO
    billing: OrderDetailsAddressOuputDTO
  }
  prices: { totalCosts: string }
  status: { label: string }
  updatedAt: string
  createdAt: string
}
