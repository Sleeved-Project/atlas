export interface AdsFilters {
  page?: number
  limit?: number
}

export interface AdCheckoutDTO {
  ad: {
    original_price: number
    finish: {
      label: string
    }
    condition: {
      label: string
    }
    seller: {
      id: string
      profilePictureUrl: string | null
      username: string
    }
    card: {
      name: string
    }
    certificate: {
      grade: {
        label: string
      }
      globalRating: string
    } | null
  }
  prices: {
    shippingCosts: string
    serviceCosts: string
    totalCosts: string
  }
}
