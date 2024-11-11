import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { useProductCreationValidator } from "../../../validators/products/validator.create-product"
import ProductCategory from "../../../models/model.product-category"
import { PopulatedProductCategoryModel } from "../../../types/models/type.model.product-category"
import mongoose from "mongoose"
import imageStorage from "../../../helpers/image_system/storage"
import { generatePlainTextFromHtml } from "../../../helpers/methods/method.html-sanitizer"
import JwtDataExtractor from "../../../middlewares/middleware.jwt-data"
import Product from "../../../models/model.product"

export type CreateProductPayload = {
  category_id: string
  subcategory_id: string | null
  product_name: string
  quantity: number | null
  price: number | null
  discount: number | null
  color: string | null
  description: string | null
  region: string | null
  district: string | null
  featured_image: string | null
  product_images: string[] | null
  is_negotiable: boolean | null
  tags: string[] | null
}

const CreateProduct = async (req: Request, res: Response) => {
  const expected_payload = [
    "category_id",
    "subcategory_id",
    "product_name",
    "quantity",
    "price",
    "discount",
    "color",
    "description",
    "region",
    "district",
    "featured_image",
    "product_images",
    "is_negotiable",
    "tags",
  ]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: CreateProductPayload = req.body

  const validate = useProductCreationValidator(requestBody, async () => {
    try {
      // retrieve the request.authorization data
      const tokenData = await JwtDataExtractor(req)
      const tokenDataObjKeys = Object.keys(tokenData)
      if (!tokenDataObjKeys.includes("_id"))
        return res
          .status(401)
          .json({ message: "Authorization is required", code: "401", data: {} })
      const tokenDataObject = tokenData as { _id: string }
      // check for the category_id
      const categoryData = await ProductCategory.findById<
        PopulatedProductCategoryModel & mongoose.Document
      >(requestBody.category_id).populate("subcategories")
      if (!categoryData)
        return res.status(400).json({
          message: "Provided category does not exist",
          code: "400",
          data: {},
        })

      if (categoryData.isDeleted || !categoryData.isActive)
        return res.status(403).json({
          message: "Provided main category is not accessible",
          code: "403",
          data: {},
        })

      const subcategories = categoryData.subcategories

      if (requestBody.subcategory_id) {
        const subcategoryData = subcategories.filter(
          (subc) => subc._id?.toString() === requestBody.subcategory_id
        )
        if (subcategoryData.length === 0)
          return res.status(400).json({
            message: "Provided subcategory does not exist on the main category",
            code: "400",
            data: {},
          })
      }

      // upload product featured image if provided

      let featuredImage: string | null = null
      let featuredImageId: string | null = null

      if (requestBody.featured_image) {
        const uploadFeaturedImage = await imageStorage({
          lastId: null,
          photo_data: requestBody.featured_image,
          folder: "products/featured-images",
        })
        featuredImage = uploadFeaturedImage.secure_url || null
        featuredImageId = uploadFeaturedImage.photo_id || null
      }

      // upload product images if any
      let productImagesArray: {
        productImageUrl: string
        productImageId: string
      }[] = []

      if (requestBody.product_images) {
        if (requestBody.product_images.length > 0) {
          for (let i = 0; i < requestBody.product_images.length; i++) {
            const productPhoto = requestBody.product_images[i]
            const { photo_id, secure_url } = await imageStorage({
              lastId: null,
              photo_data: productPhoto,
              folder: "products",
            })

            if (photo_id && secure_url) {
              productImagesArray = [
                ...productImagesArray,
                { productImageId: photo_id, productImageUrl: secure_url },
              ]
            }
          }
        }
      }

      // generate plain text from description (html) if provided
      let plainTextDescription: string | null = null
      if (requestBody.description) {
        plainTextDescription = generatePlainTextFromHtml(
          requestBody.description
        )
      }

      // save the product
      const newProduct = new Product({
        vendorId: tokenDataObject._id,
        categoryId: requestBody.category_id,
        subcategoryId:
          typeof requestBody.subcategory_id === "string"
            ? requestBody.subcategory_id
            : null,
        productName: requestBody.product_name,
        quantity:
          typeof requestBody.quantity === "number"
            ? Math.abs(requestBody.quantity)
            : null,
        price:
          typeof requestBody.price === "number"
            ? Math.abs(requestBody.price)
            : null,
        discount:
          typeof requestBody.discount === "number"
            ? Math.abs(requestBody.discount)
            : null,
        color: typeof requestBody.color === "string" ? requestBody.color : null,
        description:
          typeof requestBody.description === "string"
            ? requestBody.description
            : null,
        plainTextDescription,
        region:
          typeof requestBody.region === "string" ? requestBody.region : null,
        district:
          typeof requestBody.district === "string"
            ? requestBody.district
            : null,
        featuredImage,
        featuredImageId,
        productImages: productImagesArray,
        isNegotiable:
          typeof requestBody.is_negotiable === "boolean"
            ? requestBody.is_negotiable
            : null,
        tags: Array.isArray(requestBody.tags) ? requestBody.tags : null,
      })
      const createdProduct = await newProduct.save()
      const discountedPrice = !createdProduct?.price
        ? null
        : !createdProduct?.discount
        ? null
        : Number(
            Number(
              createdProduct.price -
                createdProduct?.price * (createdProduct?.discount / 100)
            ).toFixed(2)
          )
      return res.status(201).json({
        message: "New product is created",
        code: "201",
        data: { product: { ...createdProduct?.toObject(), discountedPrice } },
      })
    } catch (error) {
      return res.status(500).json({
        message: "Whoops! Something went wrong",
        code: "500",
        data: {},
      })
    }
  })
  if (validate !== undefined)
    return res
      .status(400)
      .json({ message: validate.error, code: "400", data: {} })
}
export default CreateProduct
