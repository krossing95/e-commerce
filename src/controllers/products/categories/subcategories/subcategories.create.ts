import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../../helpers/request/helper.request"
import { useProductSubcategoryCreationValidator } from "../../../../validators/product-categories/subcategories/validator.create-subcategory"
import ProductCategory from "../../../../models/model.product-category"
import ProductSubcategory from "../../../../models/model.subcategory"
import {
  PopulatedProductCategoryModel,
  ProductCategoryModel,
} from "../../../../types/models/type.model.product-category"
import { ProductSubcategoryModel } from "../../../../types/models/type.model.subcategory"
import mongoose from "mongoose"

export type CreateProductSubcategoryPayload = {
  categoryId: string
  subcategory: string
}

const CreateProductSubcategory = async (req: Request, res: Response) => {
  const expected_payload = ["categoryId", "subcategory"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: CreateProductSubcategoryPayload = req.body

  const validate = useProductSubcategoryCreationValidator(
    requestBody,
    async () => {
      try {
        // check the existence of the categoryId
        // check subcategory conflict on the categoryId
        const [categoryData, subcategoryWithSameName] = await Promise.all([
          ProductCategory.findById<ProductCategoryModel>(
            requestBody.categoryId
          ),
          ProductSubcategory.findOne<ProductSubcategoryModel>({
            categoryId: requestBody.categoryId,
            subcategory: requestBody.subcategory,
          }),
        ])
        if (!categoryData)
          return res
            .status(404)
            .json({ message: "Main category not found", code: "404", data: {} })

        if (categoryData.isDeleted)
          return res.status(403).json({
            message: "Cannot assign subcategory to a deleted main category",
            code: "403",
            data: {},
          })

        if (subcategoryWithSameName)
          return res.status(409).json({
            message:
              "A subcategory with same name already registered on the provided main category",
            code: "409",
            data: {},
          })

        // save the subcategory
        const newSubcategory = new ProductSubcategory({
          categoryId: requestBody.categoryId,
          subcategory: requestBody.subcategory,
        })
        const createdSubcategory = await newSubcategory.save()
        // assign the new subcategory to the main category
        const addSubcategoryToMains = await ProductCategory.findByIdAndUpdate<
          PopulatedProductCategoryModel & mongoose.Document
        >(
          requestBody.categoryId,
          { $push: { subcategories: createdSubcategory?._id } },
          { new: true }
        ).populate("subcategories")

        const { categoryImageId, ...sendableCategory } =
          addSubcategoryToMains?.toObject() as PopulatedProductCategoryModel

        return res.status(201).json({
          message: "Product subcategory created successfully",
          code: "201",
          data: { subcategory: createdSubcategory, category: sendableCategory },
        })
      } catch (error) {
        console.log(error)

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
export default CreateProductSubcategory
