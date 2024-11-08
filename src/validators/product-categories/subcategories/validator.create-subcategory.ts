import { NextFunction } from "express"
import { CreateProductSubcategoryPayload } from "../../../controllers/products/categories/subcategories/subcategories.create"
import { cleanExcessWhiteSpaces } from "../../../helpers/methods/method.string"
import { Regex } from "../../../lib/static/static.index"

export const useProductSubcategoryCreationValidator = (
  data: CreateProductSubcategoryPayload,
  next: NextFunction
) => {
  const { categoryId, subcategory } = data
  const refinedSubCategory = cleanExcessWhiteSpaces(subcategory)
  if (refinedSubCategory.length === 0)
    return { error: "Subcategory is required" }

  if (refinedSubCategory.includes("<script>"))
    return { error: "Subcategory is required" }

  if (!Regex.MONGOOBJECT.test(categoryId))
    return { error: "Incorrect main category data" }

  next()
}
