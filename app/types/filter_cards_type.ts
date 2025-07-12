import { PaginateOutputDTO } from './paginate_dto_type.js'

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

export interface PaginatedFilterCardsOutputDTO extends FilterCardsOutputDTO {
  meta: PaginateOutputDTO
}
