import { ProductSubcategoryModel } from "./type.model.subcategory"

export type ProductCategoryModel = {
  _id: string
  category: string
  subcategories: string[]
  categoryImage: string | null
  categoryImageId: string | null
  description: string | null
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type PopulatedProductCategoryModel = Omit<
  ProductCategoryModel,
  "subcategories"
> & {
  subcategories: ProductSubcategoryModel[]
}
