import { NextFunction } from "express"
import { cleanExcessWhiteSpaces } from "../../../helpers/methods/method.string"
import { Regex } from "../../../lib/static/static.index"
import { UpdateProductSubcategoryPayload } from "../../../controllers/products/categories/subcategories/subcategories.update"

export const useProductSubcategoryUpdationValidator = (
  data: UpdateProductSubcategoryPayload,
  next: NextFunction
) => {
  const { category_id, subcategory_id, subcategory, is_active } = data
  const refinedSubCategory = cleanExcessWhiteSpaces(subcategory)
  if (refinedSubCategory.length === 0)
    return { error: "Subcategory is required" }

  if (refinedSubCategory.includes("<script>"))
    return { error: "Subcategory is required" }

  if (!Regex.MONGOOBJECT.test(category_id))
    return { error: "Incorrect main category ID data" }

  if (!Regex.MONGOOBJECT.test(subcategory_id))
    return { error: "Incorrect subcategory ID data" }

  if (![true, false].includes(is_active))
    return { error: "Incorrect data @'is_active' Boolean expected" }

  next()
}
