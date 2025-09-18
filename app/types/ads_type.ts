export interface AdsFilters {
  page?: number
  limit?: number
}

export interface AdCheckoutDTO {
  ad: {
    rectoImageUrl: string
    originalPrice: string
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
