export interface FilterItem {
  id: number
  value: string
}

export interface FilterCardsOutputDTO {
  artists: FilterItem[]
  rarities: FilterItem[]
  subtypes: FilterItem[]
  types: FilterItem[]
}
