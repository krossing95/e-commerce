import { Request, Response } from "express"
import mongoose from "mongoose"
import { Regex } from "../../../lib/static/static.index"
import Product from "../../../models/model.product"
import ProductCategory from "../../../models/model.product-category"
import {
  PopulatedProductCategoryModel,
  ProductCategoryModel,
} from "../../../types/models/type.model.product-category"
import destroyImage from "../../../helpers/image_system/destroy"
import ProductSubcategory from "../../../models/model.subcategory"

const DeleteProductCategory = async (req: Request, res: Response) => {
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

    // check if products are associated to the category
    const [productsByCategoryCount] = await Promise.all([
      Product.countDocuments({
        categoryId,
      }),
    ])

    if (productsByCategoryCount > 0) {
      // set isDeleted to false
      const disableCategory = await ProductCategory.findByIdAndUpdate<
        PopulatedProductCategoryModel & mongoose.Document
      >(categoryId, { isDeleted: true }, { new: true }).populate(
        "subcategories"
      )
      if (!disableCategory)
        return res
          .status(404)
          .json({ message: "Category not found", code: "404", data: {} })

      const { categoryImageId, ...sendableCategory } =
        disableCategory?.toObject() as PopulatedProductCategoryModel

      return res.status(200).json({
        message: "Category disabled successfully",
        code: "200",
        data: {
          category: sendableCategory,
          meta_data: {
            miscellaneous: [
              {
                name: "category_deletion",
                data: "the product category has products assigned to it. Therefore, it was disabled",
              },
            ],
          },
        },
      })
    }
    // delete the category permanently
    const deleteCategory = await ProductCategory.findByIdAndDelete<
      ProductCategoryModel & mongoose.Document
    >(categoryId)
    if (!deleteCategory)
      return res
        .status(404)
        .json({ message: "Category not found", code: "404", data: {} })

    const { categoryImageId, ...sendableCategory } =
      deleteCategory?.toObject() as ProductCategoryModel

    // delete uploaded photo if exists

    if (categoryImageId) {
      await destroyImage(categoryImageId)
    }

    // delete the subcategories

    const subcategories = sendableCategory.subcategories

    await ProductSubcategory.deleteMany({ _id: { $in: subcategories } })

    return res.status(200).json({
      message: "Category deleted successfully",
      code: "200",
      data: {
        category: sendableCategory,
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default DeleteProductCategory
