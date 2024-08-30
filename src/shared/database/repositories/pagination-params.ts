export type PaginationParams = {
  pageIndex: number
  perPage: number
  search?: string
}

export type PaginationMeta = {
  totalCount: number
  pageIndex: number
  perPage: number
}

export type PaginationResult<T> = {
  payload: T[]
  meta: PaginationMeta
}
