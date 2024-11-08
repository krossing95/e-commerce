import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../../helpers/request/helper.request"
import { useProductSubcategoryUpdationValidator } from "../../../../validators/product-categories/subcategories/validator.update-subcategory"
import ProductCategory from "../../../../models/model.product-category"
import { ProductCategoryModel } from "../../../../types/models/type.model.product-category"
import mongoose from "mongoose"
import ProductSubcategory from "../../../../models/model.subcategory"
import {
  PopulatedProductSubcategoryModel,
  ProductSubcategoryModel,
} from "../../../../types/models/type.model.subcategory"

export type UpdateProductSubcategoryPayload = {
  subcategory_id: string
  category_id: string
  subcategory: string
  is_active: boolean
}

const UpdateProductSubcategory = async (req: Request, res: Response) => {
  const expected_payload = [
    "subcategory_id",
    "category_id",
    "subcategory",
    "is_active",
  ]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: UpdateProductSubcategoryPayload = req.body
  const validate = useProductSubcategoryUpdationValidator(
    requestBody,
    async () => {
      try {
        // check if the category exists
        // check if the succategory is for the category
        // check for subcategory conflict
        const [categoryData, subcategoryData, subcategoryWithSameName] =
          await Promise.all([
            ProductCategory.findById<ProductCategoryModel & mongoose.Document>(
              requestBody.category_id
            ),
            ProductSubcategory.findOne<
              ProductSubcategoryModel & mongoose.Document
            >({
              categoryId: requestBody.category_id,
              _id: requestBody.subcategory_id,
            }),
            ProductSubcategory.findOne<ProductSubcategoryModel>({
              categoryId: requestBody.category_id,
              subcategory: requestBody.subcategory,
            }),
          ])
        if (!categoryData)
          return res
            .status(404)
            .json({ message: "Main category not found", code: "404", data: {} })
        if (!subcategoryData)
          return res.status(404).json({
            message: "Subcategory not found",
            code: "404",
            data: {},
          })

        if (subcategoryWithSameName) {
          if (
            subcategoryWithSameName._id.toString() !==
            requestBody.subcategory_id
          )
            return res.status(409).json({
              message:
                "Subcategory with same name already registered on the provided main category",
              code: "409",
              data: {},
            })
        }
        // update the subcategory

        const updatedSubcategory = await ProductSubcategory.findByIdAndUpdate<
          PopulatedProductSubcategoryModel & mongoose.Document
        >(
          requestBody.subcategory_id,
          {
            subcategory: requestBody.subcategory,
            isActive: requestBody.is_active,
          },
          { new: true }
        ).populate("categoryId")

        const { categoryId, ...sendableSubcategory } =
          updatedSubcategory?.toObject() as PopulatedProductSubcategoryModel

        const { categoryImageId, ...category } = categoryId
        const returnableData = { ...sendableSubcategory, category }

        return res.status(200).json({
          message: "Subcategory updated successfully",
          code: "200",
          data: { subcategory: returnableData },
        })
      } catch (error) {
        return res.status(500).json({
          message: "Whoops! Something went wrong",
          code: "500",
          data: {},
        })
      }
    }
  )
  if (validate !== undefined)
    return res
      .status(400)
      .json({ message: validate.error, code: "400", data: {} })
}
export default UpdateProductSubcategory
