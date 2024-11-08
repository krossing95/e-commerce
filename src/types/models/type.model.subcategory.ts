import { ProductCategoryModel } from "./type.model.product-category"

export type ProductSubcategoryModel = {
  _id: string
  categoryId: string
  subcategory: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type PopulatedProductSubcategoryModel = Omit<
  ProductSubcategoryModel,
  "categoryId"
> & {
  categoryId: ProductCategoryModel
}
