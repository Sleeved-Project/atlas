import { PaginateOutputDTO } from './paginate_dto_type.js'

export interface FilterItem {
  id: number
  value: string
}

export interface PaginatedFilterCardsOutputDTO {
  paginatedArtists: { data: FilterItem[]; meta: PaginateOutputDTO }
  rarities: FilterItem[]
  subtypes: FilterItem[]
  types: FilterItem[]
}
