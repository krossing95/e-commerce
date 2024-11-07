export type MetaData = {
  totalPages: number
  totalCount: number
  currentPage: number
  pageSize: number
  miscellaneous?: {
    name: string
    data: any
  }[]
}
