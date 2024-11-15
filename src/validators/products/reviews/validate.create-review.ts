import { NextFunction } from "express"
import { CreateProductReviewPayload } from "../../../controllers/products/products/reviews/reviews.create"
import { Regex } from "../../../lib/static/static.index"

export const useProductReviewCreationPayload = (
  data: CreateProductReviewPayload,
  next: NextFunction
) => {
  const { product_id, rate, review } = data

  if (!Regex.MONGOOBJECT.test(product_id))
    return { error: "Product ID is required" }

  if (typeof rate !== "number" && typeof review !== "string")
    return { error: "Provide either a star rate or a product review" }

  if (typeof rate === "number") {
    if (rate < 1 || rate > 5)
      return { error: "Star rate must be a number between 1 & 5" }
  }

  next()
}
