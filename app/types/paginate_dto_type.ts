export interface PaginateOutputDTO {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl: string | null
  previousPageUrl: string | null
}

export type PaginatedResponse<T> = {
  meta: PaginateOutputDTO
  data: T[]
}
