import { Request, Response } from "express"
import { Regex } from "../../../../lib/static/static.index"
import { paginationSetup } from "../../../../configs/pagination/pagination.config"
import ProductSubcategory from "../../../../models/model.subcategory"
import { PopulatedProductSubcategoryModel } from "../../../../types/models/type.model.subcategory"
import mongoose, { SortOrder } from "mongoose"
import { MetaData } from "../../../../types/type.metadata"
import { ProductCategoryModel } from "../../../../types/models/type.model.product-category"

const FetchProductSubcategories = async (req: Request, res: Response) => {
  try {
    // retrieve the query params
    const isActive = req.query?.isActive as string | undefined
    const page = req.query?.page as string | undefined
    const pageDensity = req.query?.resultsPerPage as string | undefined
    const q = req.query?.q as string | undefined
    const orderBy = req.query?.orderBy as string | undefined
    const categoryId = req.query?.categoryId as string | undefined

    if (!categoryId)
      return res
        .status(400)
        .json({ message: "Category Id is required", code: "400", data: {} })

    if (!Regex.MONGOOBJECT.test(categoryId))
      return res
        .status(400)
        .json({ message: "Category Id is required", code: "400", data: {} })

    const params = {
      categoryId,
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
        { categoryId: params.categoryId },
        ...(params.isActive === null ? [] : [{ isActive: params.isActive }]),
        {
          $or: [{ subcategory: { $regex: regex } }],
        },
      ],
    }

    // setup pagination values
    const {
      limit,
      page: pageNumber,
      skip,
    } = paginationSetup({ page: params.page, page_density: params.pageDensity })

    const sortOptions = { subcategory: params.orderBy as SortOrder }

    const [totalCount, results] = await Promise.all([
      ProductSubcategory.countDocuments(query),
      ProductSubcategory.find<
        PopulatedProductSubcategoryModel & mongoose.Document
      >(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .populate("categoryId")
        .exec(),
    ])

    const meta_data: MetaData = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: pageNumber,
      pageSize: limit,
    }

    const sendableSubcategoryList = results.map((result) => {
      const { categoryId, ...sendables } =
        result?.toObject() as PopulatedProductSubcategoryModel
      const { categoryImageId, ...category } = categoryId
      return { ...sendables, category }
    })

    const returnableData: {
      collection: PopulatedProductSubcategoryModel[]
      meta_data: typeof meta_data
    } = JSON.parse(
      JSON.stringify({
        collection: sendableSubcategoryList,
        meta_data,
      })
    )
    return res
      .status(200)
      .json({ message: "", code: "200", data: { ...returnableData } })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default FetchProductSubcategories
