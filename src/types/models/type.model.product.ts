import { ProductPublishingStatusEnum } from "../../lib/enum/enum.index"
import { ProductCategoryModel } from "./type.model.product-category"
import { ProductSubcategoryModel } from "./type.model.subcategory"
import { UserModel } from "./type.model.user"

export type ProductModel = {
  _id: string
  vendorId: string
  categoryId: string
  subcategoryId: string | null
  productName: string
  quantity: number | null
  quantitySold: number | null
  price: number | null
  discount: number | null
  color: string | null
  description: string | null
  plainTextDescription: string | null
  region: string | null
  district: string | null
  featuredImage: string | null
  featuredImageId: string | null
  productImages: { productImageUrl: string; productImageId: string }[]
  publishingStatus: ProductPublishingStatusEnum
  isNegotiable: boolean | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type PopulatedProductModel = Omit<
  ProductModel,
  "vendorId" | "categoryId" | "subcategoryId"
> & {
  vendorId: UserModel
  categoryId: ProductCategoryModel
  subcategoryId: ProductSubcategoryModel
}
