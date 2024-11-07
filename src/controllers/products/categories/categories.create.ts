import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { useProductCategoryCreationValidator } from "../../../validators/product-categories/validator.create-category"
import ProductCategory from "../../../models/model.product-category"
import { ProductCategoryModel } from "../../../types/models/type.model.product-category"
import imageStorage from "../../../helpers/image_system/storage"

export type CreateProductCategoryPayload = {
  category: string
  description: string | null
  category_image: string | null
}

const CreateProductCategory = async (req: Request, res: Response) => {
  const expected_payload = ["category", "description", "category_image"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: CreateProductCategoryPayload = req.body

  const validate = useProductCategoryCreationValidator(
    requestBody,
    async () => {
      try {
        // check for category conflict
        const categoryWithSameName =
          await ProductCategory.findOne<ProductCategoryModel>({
            category: requestBody.category,
          })
        if (categoryWithSameName)
          return res.status(409).json({
            message: "Category with same name already created",
            code: "409",
            data: {},
          })

        let categoryImage: string | null = null
        let categoryImageId: string | null = null

        // upload the category image if exists
        if (requestBody.category_image) {
          const uploadImage = await imageStorage({
            lastId: null,
            photo_data: requestBody.category_image,
            folder: "product-category",
          })
          categoryImage = uploadImage.secure_url || null
          categoryImageId = uploadImage.photo_id || null
        }

        //  create the category
        const newProductCategory = new ProductCategory({
          category: requestBody.category,
          categoryImage,
          categoryImageId,
          description: requestBody.description,
        })

        const createdCategory = (
          await newProductCategory.save()
        )?.toObject() as ProductCategoryModel
        const { categoryImageId: id, ...sendableCategory } = createdCategory

        return res.status(201).json({
          message: "Product category created",
          code: "201",
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
export default CreateProductCategory
