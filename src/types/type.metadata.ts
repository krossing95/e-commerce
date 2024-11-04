export type MetaData = {
  totalPage: number
  totalCount: number
  currentPage: number
  pageSize: number
  miscellaneous?: {
    name: string
    data: any
  }[]
}
