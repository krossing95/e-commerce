import { Request, Response } from "express"
import { Regex } from "../../../lib/static/static.index"
import Product from "../../../models/model.product"
import { PopulatedProductModel } from "../../../types/models/type.model.product"
import mongoose from "mongoose"
import { discountCalculation } from "../../../helpers/methods/method.on-product"
import ProductReview from "../../../models/model.product-review"
import { PopulatedProductReviewModel } from "../../../types/models/type.model.product-review"
import { ProductPublishingStatusEnum } from "../../../lib/enum/enum.index"

const FetchASingleProduct = async (req: Request, res: Response) => {
  try {
    if (!req.query?.productId)
      return res
        .status(400)
        .json({ message: "Product ID is required", code: "400", data: {} })

    const productId = req.query?.productId as string
    const isPublished = req.query?.isPublished as string | undefined

    const refinedPublishingStatus = !isPublished
      ? ProductPublishingStatusEnum.PUBLISHED
      : !["true", "false"].includes(isPublished.toLowerCase())
      ? ProductPublishingStatusEnum.PUBLISHED
      : isPublished.toLowerCase() === "false"
      ? ProductPublishingStatusEnum.DRAFTED
      : ProductPublishingStatusEnum.PUBLISHED

    if (!Regex.MONGOOBJECT.test(productId))
      return res
        .status(400)
        .json({ message: "Product ID is required", code: "400", data: {} })

    // find the product by ID
    const productData = await Product.findOne<
      PopulatedProductModel & mongoose.Document
    >({ productId, publishingStatus: refinedPublishingStatus }).populate([
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
    ])
    if (!productData)
      return res
        .status(404)
        .json({ message: "Product not found", code: "404", data: {} })

    const {
      categoryId,
      subcategoryId,
      featuredImageId,
      productImages,
      ...restProductInformation
    } = productData.toObject() as PopulatedProductModel

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
      starRating: 0,
    }
    // retrieve the average rate
    const averageRateResult = await ProductReview.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          isDeleted: false,
        },
      },
      { $group: { _id: "$productId", averageRate: { $avg: "$rate" } } },
    ])

    const averageRate =
      averageRateResult.length > 0
        ? (averageRateResult[0].averageRate as number)
        : 0
    returnableProduct.starRating = averageRate
    // retrieve 10 related products based on the category and subcategory
    const relatedProducts = await Product.find<
      PopulatedProductModel & mongoose.Document
    >({
      $and: [
        { isDeleted: false },
        { _id: { $ne: new mongoose.Types.ObjectId(productId) } },
        { categoryId: returnableProduct.category._id },
        { publishingStatus: ProductPublishingStatusEnum.PUBLISHED },
        {
          $or: [{ subcategoryId: returnableProduct.subcategory?._id }],
        },
      ],
    })
      .populate([
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
      ])
      .limit(10)

    const sendableRelatedProductList = relatedProducts.map((relatedProduct) => {
      const {
        categoryId,
        subcategoryId,
        featuredImageId,
        productImages,
        ...restRelatedProductInformation
      } = relatedProduct.toObject() as PopulatedProductModel

      // calculate discounted price

      const discountedPrice = discountCalculation({
        price: restRelatedProductInformation.price,
        discount: restRelatedProductInformation.discount,
      })

      const returnableRelatedProduct = {
        ...restRelatedProductInformation,
        category: categoryId,
        subcategory: subcategoryId,
        productImages: productImages.map((img) => img.productImageUrl),
        discountedPrice,
        starRating: 0,
      }

      return returnableRelatedProduct
    })

    // get the rates for each of the related products
    const productIds = sendableRelatedProductList.map((relatedProduct) =>
      relatedProduct._id.toString()
    )

    let rates: { product_id: string; rate: number }[] = []

    if (productIds.length > 0) {
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i]
        const result = await ProductReview.aggregate([
          {
            $match: {
              productId: new mongoose.Types.ObjectId(productId),
              isDeleted: false,
            },
          },
          { $group: { _id: "$productId", averageRate: { $avg: "$rate" } } },
        ])

        const averageRate =
          result.length > 0 ? (result[0].averageRate as number) : 0

        rates = [...rates, { product_id: productId, rate: averageRate }]
      }
    }

    const sendableRelatedProductListWtRates = sendableRelatedProductList.map(
      (relatedProduct) => {
        rates.map((rate) => {
          if (rate.product_id.toString() === relatedProduct._id.toString()) {
            relatedProduct.starRating = rate.rate
          }
        })
        return relatedProduct
      }
    )

    // retrieve the reviews and rates
    const [reviewsAndRate, reviewCount] = await Promise.all([
      ProductReview.find<PopulatedProductReviewModel & mongoose.Document>({
        productId,
      }).populate([
        {
          path: "customerId",
          select:
            "-password -mfaActivated -mfaActivatedAt -usertype -usertype -gender -isVerified -isDeleted -isSocial",
        },
      ]),
      ProductReview.countDocuments({
        productId,
      }),
    ])
    const sendableReviewsAndRate = reviewsAndRate.map((review) => {
      const { productId, customerId, ...sendableReview } =
        review.toObject() as PopulatedProductReviewModel

      return {
        ...sendableReview,
        customer: customerId,
      }
    })

    const returnableData = {
      product: returnableProduct,
      totalReviews: reviewCount,
      relatedProducts: sendableRelatedProductListWtRates,
      reviews: sendableReviewsAndRate,
    }
    return res
      .status(200)
      .json({ message: "", code: "200", data: { ...returnableData } })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default FetchASingleProduct
