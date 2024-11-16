import { Request, Response } from "express"
import JwtDataExtractor from "../../../middlewares/middleware.jwt-data"
import { Regex } from "../../../lib/static/static.index"
import { paginationSetup } from "../../../configs/pagination/pagination.config"
import mongoose, { SortOrder } from "mongoose"
import Product from "../../../models/model.product"
import { PopulatedProductModel } from "../../../types/models/type.model.product"
import { MetaData } from "../../../types/type.metadata"
import { discountCalculation } from "../../../helpers/methods/method.on-product"
import ProductReview from "../../../models/model.product-review"
import { ProductPublishingStatusEnum } from "../../../lib/enum/enum.index"

const FetchProductsByVendor = async (req: Request, res: Response) => {
  try {
    // retrieve the request.authorization data
    const tokenData = await JwtDataExtractor(req)
    const tokenDataObjKeys = Object.keys(tokenData)
    if (!tokenDataObjKeys.includes("_id"))
      return res
        .status(401)
        .json({ message: "Authorization is required", code: "401", data: {} })
    const tokenDataObject = tokenData as { _id: string; email: string }
    // retrieve the query params
    const isPublished = req.query?.isPublished as string | undefined
    const isDeleted = req.query?.isDeleted as string | undefined
    const page = req.query?.page as string | undefined
    const pageDensity = req.query?.resultsPerPage as string | undefined
    const q = req.query?.q as string | undefined
    const orderBy = req.query?.orderBy as string | undefined

    const params = {
      isPublished: !isPublished
        ? null
        : !["true", "false"].includes(isPublished.toLowerCase())
        ? null
        : isPublished.toLowerCase() === "false"
        ? ProductPublishingStatusEnum.DRAFTED
        : ProductPublishingStatusEnum.PUBLISHED,
      isDeleted: !isDeleted
        ? null
        : !["true", "false"].includes(isDeleted.toLowerCase())
        ? null
        : isDeleted.toLowerCase(),
      page: !page ? 1 : !Regex.NUMERICAL.test(page) ? 1 : Number(page),
      pageDensity: !pageDensity
        ? Number(process.env.ECOM_PAGE_DENSITY)
        : !Regex.NUMERICAL.test(pageDensity)
        ? Number(process.env.ECOM_PAGE_DENSITY)
        : Number(pageDensity),
      q: q || "",
      orderBy: !orderBy
        ? "asc"
        : !["asc", "desc"].includes(orderBy)
        ? "asc"
        : orderBy.toLowerCase(),
    }

    const regex = new RegExp(params.q, "i")
    const query = {
      $and: [
        { vendorId: tokenDataObject._id },
        ...(params.isPublished === null
          ? []
          : [{ publishingStatus: params.isPublished }]),
        ...(params.isDeleted === null ? [] : [{ isDeleted: params.isDeleted }]),
        {
          $or: [
            { productName: { $regex: regex } },
            { color: { $regex: regex } },
            { plainTextDescription: { $regex: regex } },
            { region: { $regex: regex } },
            { district: { $regex: regex } },
            { publishingStatus: { $regex: regex } },
            { description: { $regex: regex } },
            { tags: { $in: [regex] } },
          ],
        },
      ],
    }

    // setup pagination values
    const {
      limit,
      page: pageNumber,
      skip,
    } = paginationSetup({ page: params.page, page_density: params.pageDensity })

    const sortOptions = { createdAt: params.orderBy as SortOrder }

    const [totalCount, results] = await Promise.all([
      Product.countDocuments(query),
      Product.find<PopulatedProductModel & mongoose.Document>(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
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
        .exec(),
    ])

    const meta_data: MetaData = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: pageNumber,
      pageSize: limit,
    }

    const sendableProductList = results.map((result) => {
      const {
        categoryId,
        subcategoryId,
        featuredImageId,
        vendorId,
        productImages,
        ...restPoductInformation
      } = result.toObject() as PopulatedProductModel

      // calculate discounted price

      const discountedPrice = discountCalculation({
        price: restPoductInformation.price,
        discount: restPoductInformation.discount,
      })

      const returnableProduct = {
        ...restPoductInformation,
        category: categoryId,
        subcategory: subcategoryId,
        vendor: vendorId,
        productImages: productImages.map((img) => img.productImageUrl),
        discountedPrice,
        starRating: 0,
      }

      return returnableProduct
    })

    // get the rates for each of the products
    const productIds = sendableProductList.map((product) =>
      product._id.toString()
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

    const sendableProductListWtRates = sendableProductList.map((product) => {
      rates.map((rate) => {
        if (rate.product_id.toString() === product._id.toString()) {
          product.starRating = rate.rate
        }
      })
      return product
    })

    const returnableData: {
      collection: (typeof sendableProductListWtRates)[]
      meta_data: typeof meta_data
    } = JSON.parse(
      JSON.stringify({
        collection: sendableProductListWtRates,
        meta_data,
      })
    )
    return res
      .status(200)
      .json({ message: "", code: "200", data: { ...returnableData } })
  } catch (error) {
    return res.status(500).json({
      message: "Whoops! Something went wrong",
      code: "500",
      data: {},
    })
  }
}
export default FetchProductsByVendor
