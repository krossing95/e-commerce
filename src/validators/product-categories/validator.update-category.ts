import { NextFunction } from "express"
import { cleanExcessWhiteSpaces } from "../../helpers/methods/method.string"
import { Regex } from "../../lib/static/static.index"
import { UpdateProductCategoryPayload } from "../../controllers/products/categories/categories.update"

export const useProductCategoryUpdationValidator = (
  data: UpdateProductCategoryPayload,
  next: NextFunction
) => {
  const { category, category_image, category_id, is_active } = data

  // validate the category
  const refinedCategory = cleanExcessWhiteSpaces(category)
  if (refinedCategory.length === 0) return { error: "Category is required" }

  if (refinedCategory.includes("<script>"))
    return { error: "Category is required" }

  if (category_image) {
    const imageParts = category_image.split(",", 2)
    if (imageParts.length === 2) {
      const imageExtension = imageParts[0]
      const imageData = imageParts[1]
      if (!Regex.ISBASE64.test(imageData))
        return { error: "Invalid category image detected" }
      if (
        imageExtension !== "data:image/png;base64" &&
        imageExtension !== "data:image/jpeg;base64" &&
        imageExtension !== "data:image/jpg;base64" &&
        imageExtension !== "data:image/webp;base64"
      )
        return {
          error: "Choose jpeg, jpg, png, webp files only.",
        }
    }
  }

  if (![true, false].includes(is_active))
    return { error: "Incorrect data @'is_active' Boolean expected" }

  if (!Regex.MONGOOBJECT.test(category_id)) return { error: "Incorrect data" }

  next()
}
