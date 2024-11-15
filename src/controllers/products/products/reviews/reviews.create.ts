import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../../helpers/request/helper.request"
import { useProductReviewCreationPayload } from "../../../../validators/products/reviews/validate.create-review"
import JwtDataExtractor from "../../../../middlewares/middleware.jwt-data"
import Product from "../../../../models/model.product"
import { ProductModel } from "../../../../types/models/type.model.product"
import mongoose from "mongoose"
import ProductReview from "../../../../models/model.product-review"
import { ProductReviewModel } from "../../../../types/models/type.model.product-review"
import { fetchProductWithStarRates } from "./reviews.product"

export type CreateProductReviewPayload = {
  product_id: string
  rate: number | null
  review: string | null
}

const CreateProductReview = async (req: Request, res: Response) => {
  const expected_payload = ["product_id", "rate", "review"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: CreateProductReviewPayload = req.body

  const validate = useProductReviewCreationPayload(requestBody, async () => {
    try {
      // retrieve the request.authorization data
      const tokenData = await JwtDataExtractor(req)
      const tokenDataObjKeys = Object.keys(tokenData)
      if (!tokenDataObjKeys.includes("_id"))
        return res
          .status(401)
          .json({ message: "Authorization is required", code: "401", data: {} })
      const tokenDataObject = tokenData as { _id: string }

      // retrieve the product
      // check if the customer already rated or reviewed the product
      const [productData, customersReview] = await Promise.all([
        Product.findById<ProductModel & mongoose.Document>(
          requestBody.product_id
        ),
        ProductReview.findOne<ProductReviewModel & mongoose.Document>({
          productId: requestBody.product_id,
          customerId: tokenDataObject._id,
        }),
      ])

      if (!productData)
        return res
          .status(404)
          .json({ message: "Product not found", code: "404", data: {} })

      if (customersReview) {
        customersReview.rate = requestBody.rate
        customersReview.review = requestBody.review
        customersReview.isEdited = true
        await customersReview.save()

        //  fetch the product and populate with new reviews and rating

        const productWithRates = await fetchProductWithStarRates(
          requestBody.product_id
        )

        if (!productWithRates)
          return res
            .status(404)
            .json({ message: "Could not retrieve data", code: "404", data: {} })

        return res.status(200).json({
          message: "Product reviewed or rated successfully",
          code: "200",
          data: { product: productWithRates },
        })
      }

      // create new instance of the product review model
      const newProductReview = new ProductReview({
        productId: requestBody.product_id,
        customerId: tokenDataObject._id,
        rate: requestBody.rate,
        review: requestBody.review,
      })

      await newProductReview.save()

      //  fetch the product and populate with new reviews and rating

      const productWithRates = await fetchProductWithStarRates(
        requestBody.product_id
      )

      if (!productWithRates)
        return res
          .status(404)
          .json({ message: "Could not retrieve data", code: "404", data: {} })

      return res.status(200).json({
        message: "Product reviewed or rated successfully",
        code: "200",
        data: { product: productWithRates },
      })
    } catch (error) {
      return res.status(500).json({
        message: "Whoops! Something went wrong",
        code: "500",
        data: {},
      })
    }
  })

  if (validate !== undefined)
    return res
      .status(400)
      .json({ message: validate.error, code: "400", data: {} })
}
export default CreateProductReview
