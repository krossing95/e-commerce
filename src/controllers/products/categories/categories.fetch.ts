import { Request, Response } from "express"
import { Regex } from "../../../lib/static/static.index"
import { paginationSetup } from "../../../configs/pagination/pagination.config"
import ProductCategory from "../../../models/model.product-category"
import { ProductCategoryModel } from "../../../types/models/type.model.product-category"
import mongoose, { SortOrder } from "mongoose"
import { MetaData } from "../../../types/type.metadata"

const FetchProductCategories = async (req: Request, res: Response) => {
  try {
    // retrieve the query params
    const isActive = req.query?.isActive as string | undefined
    const page = req.query?.page as string | undefined
    const pageDensity = req.query?.resultsPerPage as string | undefined
    const q = req.query?.q as string | undefined
    const orderBy = req.query?.orderBy as string | undefined

    const params = {
      isActive: !isActive
        ? null
        : !["true", "false"].includes(isActive.toLowerCase())
        ? null
        : isActive.toLowerCase(),
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
        ...(params.isActive === null ? [] : [{ isActive: params.isActive }]),
        {
          $or: [
            { category: { $regex: regex } },
            { description: { $regex: regex } },
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

    const sortOptions = { category: params.orderBy as SortOrder }

    const [totalCount, results] = await Promise.all([
      ProductCategory.countDocuments(query),
      ProductCategory.find<ProductCategoryModel & mongoose.Document>(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .exec(),
    ])

    const meta_data: MetaData = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: pageNumber,
      pageSize: limit,
    }

    const sendableCategoryList = results.map((result) => {
      const { categoryImageId, ...sendables } =
        result?.toObject() as ProductCategoryModel
      return sendables
    })

    const returnableData: {
      collection: ProductCategoryModel[]
      meta_data: typeof meta_data
    } = JSON.parse(
      JSON.stringify({
        collection: sendableCategoryList,
        meta_data,
      })
    )
    return res
      .status(200)
      .json({ message: "", code: "200", data: { ...returnableData } })
  } catch (error) {
    console.log(error)

    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default FetchProductCategories
