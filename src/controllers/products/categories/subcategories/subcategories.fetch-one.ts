import { Request, Response } from "express"
import { Regex } from "../../../../lib/static/static.index"
import ProductSubcategory from "../../../../models/model.subcategory"
import { PopulatedProductSubcategoryModel } from "../../../../types/models/type.model.subcategory"
import mongoose from "mongoose"

const FetchSingleProductSubcategory = async (req: Request, res: Response) => {
  try {
    if (!req.query?.subcategory_id)
      return res
        .status(400)
        .json({ message: "Bad request", code: "400", data: {} })

    const subcategoryId = req.query?.subcategory_id as string

    if (!Regex.MONGOOBJECT.test(subcategoryId))
      return res
        .status(400)
        .json({ message: "Bad request", code: "400", data: {} })

    const subCategoryData = await ProductSubcategory.findById<
      PopulatedProductSubcategoryModel & mongoose.Document
    >(subcategoryId).populate("categoryId")

    if (!subCategoryData)
      return res
        .status(404)
        .json({ message: "Subcategory not found", code: "404", data: {} })

    const { categoryId, ...sendableSubcategory } =
      subCategoryData?.toObject() as PopulatedProductSubcategoryModel

    const { categoryImageId, ...category } = categoryId
    const returnableData = { ...sendableSubcategory, category }

    return res
      .status(200)
      .json({ message: "", code: "200", data: { subcategory: returnableData } })
  } catch (error) {
    return res.status(500).json({
      message: "Whoops! Something went wrong",
      code: "500",
      data: {},
    })
  }
}
export default FetchSingleProductSubcategory
