export type PaginationParamsProps = {
  page: number
  page_density?: number
}

export const pageDensity = Number(process.env.ECOM_PAGE_DENSITY)

export const paginationSetup = ({
  page,
  page_density = pageDensity,
}: PaginationParamsProps) => {
  const skip = (page - 1) * page_density
  return { page, limit: page_density, skip }
}
