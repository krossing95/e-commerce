import mongoose from "mongoose"
import Product from "../../../../models/model.product"
import { PopulatedProductModel } from "../../../../types/models/type.model.product"
import ProductReview from "../../../../models/model.product-review"
import { discountCalculation } from "../../../../helpers/methods/method.on-product"
import { PopulatedProductReviewModel } from "../../../../types/models/type.model.product-review"

export const fetchProductWithStarRates = async (productId: string) => {
  try {
    const [
      retrievePotentialSendableProductData,
      retrieveAverageStarRate,
      reviewsAndRate,
    ] = await Promise.all([
      Product.findOne<PopulatedProductModel & mongoose.Document>({
        productId,
      }).populate([
        {
          path: "categoryId",
          select: "-categoryImageId",
        },
        {
          path: "subcategoryId",
        },
        {
          path: "vendorId",
          select: "-password -mfaActivated -mfaActivatedAt",
        },
      ]),
      ProductReview.aggregate([
        {
          $match: {
            productId: new mongoose.Types.ObjectId(productId),
            isDeleted: false,
          },
        },
        {
          $group: { _id: "$productId", averageRate: { $avg: "$rate" } },
        },
      ]),
      ProductReview.find<PopulatedProductReviewModel & mongoose.Document>({
        productId,
      }).populate([
        {
          path: "customerId",
          select:
            "-password -mfaActivated -mfaActivatedAt -usertype -usertype -gender -isVerified -isDeleted -isSocial",
        },
      ]),
    ])

    if (!retrievePotentialSendableProductData) return null

    const {
      categoryId,
      subcategoryId,
      featuredImageId,
      productImages,
      ...restProductInformation
    } = retrievePotentialSendableProductData.toObject() as PopulatedProductModel

    // calculate discounted price

    const discountedPrice = discountCalculation({
      price: restProductInformation.price,
      discount: restProductInformation.discount,
    })

    const returnableProduct = {
      ...restProductInformation,
      category: categoryId,
      subcategory: subcategoryId,
      productImages: productImages.map((img) => img.productImageUrl),
      discountedPrice,
      starRating:
        retrieveAverageStarRate.length > 0
          ? (retrieveAverageStarRate?.[0]?.averageRate as number)
          : 0,
    }

    const sendableReviewsAndRate = reviewsAndRate.map((review) => {
      const { productId, customerId, ...sendableReview } =
        review.toObject() as PopulatedProductReviewModel

      return {
        ...sendableReview,
        customer: customerId,
      }
    })

    return { ...returnableProduct, reviews: sendableReviewsAndRate }
  } catch (error) {
    return null
  }
}
