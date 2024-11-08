import { Request, Response } from "express"
import { Regex } from "../../../../lib/static/static.index"
import Product from "../../../../models/model.product"
import ProductSubcategory from "../../../../models/model.subcategory"
import { PopulatedProductSubcategoryModel } from "../../../../types/models/type.model.subcategory"
import mongoose from "mongoose"
import ProductCategory from "../../../../models/model.product-category"

const DeleteProductSubcategory = async (req: Request, res: Response) => {
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

    // check if products are associated to the category
    const productsBySubcategoryCount = await Product.countDocuments({
      subcategoryId,
    })

    if (productsBySubcategoryCount === 0) {
      // set isDeleted to false
      const disableSubcategory = await ProductSubcategory.findByIdAndUpdate<
        PopulatedProductSubcategoryModel & mongoose.Document
      >(subcategoryId, { isDeleted: true }, { new: true }).populate(
        "categoryId"
      )
      if (!disableSubcategory)
        return res
          .status(404)
          .json({ message: "Subcategory not found", code: "404", data: {} })

      const { categoryId, ...sendableSubcategory } =
        disableSubcategory?.toObject() as PopulatedProductSubcategoryModel

      const { categoryImageId, ...category } = categoryId
      const returnableData = { ...sendableSubcategory, category }

      return res.status(200).json({
        message: "Subcategory disabled successfully",
        code: "200",
        data: {
          subcategory: returnableData,
          meta_data: {
            miscellaneous: [
              {
                name: "subcategory_deletion",
                data: "the subcategory has products assigned to it. Therefore, it was disabled",
              },
            ],
          },
        },
      })
    }

    // delete the subcategory permanently
    const deleteSubcategory = await ProductSubcategory.findByIdAndDelete<
      PopulatedProductSubcategoryModel & mongoose.Document
    >(subcategoryId).populate("categoryId")

    if (!deleteSubcategory)
      return res
        .status(404)
        .json({ message: "Subcategory not found", code: "404", data: {} })

    // remove the subcategory id from the main category
    await ProductCategory.findByIdAndUpdate(deleteSubcategory.categoryId, {
      $pull: { subcategories: subcategoryId },
    })

    const { categoryId, ...sendableSubcategory } =
      deleteSubcategory?.toObject() as PopulatedProductSubcategoryModel

    const { categoryImageId, ...category } = categoryId
    const returnableData = {
      ...sendableSubcategory,
      category: {
        ...category,
        subcategories: category.subcategories.filter(
          (subc) => subc?.toString() !== subcategoryId
        ),
      },
    }

    return res.status(200).json({
      message: "Subcategory deleted successfully",
      code: "200",
      data: {
        subcategory: returnableData,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: "Whoops! Something went wrong",
      code: "500",
      data: {},
    })
  }
}
export default DeleteProductSubcategory
