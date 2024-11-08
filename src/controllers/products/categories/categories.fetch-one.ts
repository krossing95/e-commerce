import { Request, Response } from "express"
import { Regex } from "../../../lib/static/static.index"
import ProductCategory from "../../../models/model.product-category"
import { PopulatedProductCategoryModel } from "../../../types/models/type.model.product-category"
import mongoose from "mongoose"

const FetchSingleProductCategory = async (req: Request, res: Response) => {
  try {
    if (!req.query?.category_id)
      return res
        .status(400)
        .json({ message: "Bad request", code: "400", data: {} })

    const categoryId = req.query?.category_id as string

    if (!Regex.MONGOOBJECT.test(categoryId))
      return res
        .status(400)
        .json({ message: "Bad request", code: "400", data: {} })

    const categoryData = await ProductCategory.findById<
      PopulatedProductCategoryModel & mongoose.Document
    >(categoryId).populate("subcategories")

    if (!categoryData)
      return res
        .status(404)
        .json({ message: "Category not found", code: "404", data: {} })

    const { categoryImageId, ...sendableCategory } =
      categoryData?.toObject() as PopulatedProductCategoryModel

    return res.status(200).json({
      message: "",
      code: "200",
      data: { category: sendableCategory },
    })
  } catch (error) {
    return res.status(500).json({
      message: "Whoops! Something went wrong",
      code: "500",
      data: {},
    })
  }
}
export default FetchSingleProductCategory
