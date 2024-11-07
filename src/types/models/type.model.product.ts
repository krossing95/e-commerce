export type ProductModel = {
  _id: string
  vendorId: string
  categoryId: string
  productName: string
  quantity: number
  price: number
  discount?: number
  color?: string
  description?: string
  plainTextDescription?: string
  region?: string
  town?: string
  featuredImage?: string
  featuredImageId?: string
  productImages?: { productImageUrl: string; productImageId: string }[]
  isNegotiable?: boolean
  isPublished: boolean
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}
