import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { useProductCategoryUpdationValidator } from "../../../validators/product-categories/validator.update-category"
import ProductCategory from "../../../models/model.product-category"
import {
  PopulatedProductCategoryModel,
  ProductCategoryModel,
} from "../../../types/models/type.model.product-category"
import mongoose from "mongoose"
import imageStorage from "../../../helpers/image_system/storage"

export type UpdateProductCategoryPayload = {
  category_id: string
  category: string
  description: string | null
  category_image: string | null
  is_active: boolean
}

const UpdateProductCategory = async (req: Request, res: Response) => {
  const expected_payload = [
    "category_id",
    "category",
    "description",
    "category_image",
    "is_active",
  ]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: UpdateProductCategoryPayload = req.body

  const validate = useProductCategoryUpdationValidator(
    requestBody,
    async () => {
      try {
        // retrieve the category
        // check for category conflict
        const [categoryData, categoryWithSameName] = await Promise.all([
          ProductCategory.findById<ProductCategoryModel>(
            requestBody.category_id
          ),
          ProductCategory.findOne<ProductCategoryModel>({
            category: requestBody.category,
          }),
        ])
        if (!categoryData)
          return res
            .status(404)
            .json({ message: "Category not found", code: "404", data: {} })

        if (categoryWithSameName) {
          if (categoryWithSameName._id.toString() !== requestBody.category_id)
            return res.status(409).json({
              message: "A category with same name already exists",
              code: "409",
              data: {},
            })
        }
        // upload image if exists
        let categoryImage: string | null = categoryData.categoryImage
        let categoryImageId: string | null = categoryData.categoryImageId

        if (requestBody.category_image) {
          const uploadImage = await imageStorage({
            lastId: categoryData.categoryImageId,
            photo_data: requestBody.category_image,
            folder: "product-category",
          })
          categoryImage = uploadImage.secure_url || null
          categoryImageId = uploadImage.photo_id || null
        }

        // update the category

        const updatedCategory = await ProductCategory.findByIdAndUpdate<
          PopulatedProductCategoryModel & mongoose.Document
        >(
          requestBody.category_id,
          {
            category: requestBody.category,
            categoryImage,
            categoryImageId,
            description: requestBody.description,
            isActive: requestBody.is_active,
          },
          { new: true }
        ).populate("subcategories")

        const { categoryImageId: id, ...sendableCategory } =
          updatedCategory?.toObject() as PopulatedProductCategoryModel

        return res.status(200).json({
          message: "Product category updated succesfully",
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
  )
  if (validate !== undefined)
    return res
      .status(400)
      .json({ message: validate.error, code: "400", data: {} })
}
export default UpdateProductCategory
