import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { ProductPublishingStatusEnum } from "../../../lib/enum/enum.index"
import { useProductUpdationValidator } from "../../../validators/products/validator.update-product"
import JwtDataExtractor from "../../../middlewares/middleware.jwt-data"
import Product from "../../../models/model.product"
import {
  PopulatedProductModel,
  ProductModel,
} from "../../../types/models/type.model.product"
import ProductCategory from "../../../models/model.product-category"
import { PopulatedProductCategoryModel } from "../../../types/models/type.model.product-category"
import mongoose from "mongoose"
import imageStorage from "../../../helpers/image_system/storage"
import {
  discountCalculation,
  isPublishableProduct,
} from "../../../helpers/methods/method.on-product"
import { generatePlainTextFromHtml } from "../../../helpers/methods/method.html-sanitizer"

export type UpdateProductPayload = {
  product_id: string
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
  publishing_status: ProductPublishingStatusEnum
}

const UpdateProduct = async (req: Request, res: Response) => {
  const expected_payload = [
    "product_id",
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
    "publishing_status",
  ]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: UpdateProductPayload = req.body

  const validate = useProductUpdationValidator(requestBody, async () => {
    try {
      // retrieve the request.authorization data
      const tokenData = await JwtDataExtractor(req)
      const tokenDataObjKeys = Object.keys(tokenData)
      if (!tokenDataObjKeys.includes("_id"))
        return res
          .status(401)
          .json({ message: "Authorization is required", code: "401", data: {} })
      const tokenDataObject = tokenData as { _id: string }

      //  retrieve the product by its id
      const productData = await Product.findById<ProductModel>(
        requestBody.product_id
      )
      if (!productData)
        return res
          .status(404)
          .json({ message: "Product not found", code: "404", data: {} })
      if (productData.vendorId.toString() !== tokenDataObject._id?.toString())
        return res.status(403).json({
          message: "Access to the resource is denied",
          code: "403",
          data: {},
        })

      //  check the categories provided
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
        if (subcategoryData.length !== 1)
          return res.status(400).json({
            message: "Provided subcategory does not exist on the main category",
            code: "400",
            data: {},
          })
        const subcategory = subcategoryData[0]
        if (subcategory.isDeleted || !subcategory.isActive)
          return res.status(403).json({
            message: "Provided subcategory is not accessible",
            code: "403",
            data: {},
          })
      }

      // upload product featured image if provided

      let featuredImage: string | null = productData.featuredImage
      let featuredImageId: string | null = productData.featuredImageId

      if (requestBody.featured_image) {
        const uploadFeaturedImage = await imageStorage({
          lastId: featuredImageId,
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

      if (Array.isArray(requestBody.product_images)) {
        if (productData.productImages.length === 3)
          return res.status(409).json({
            message: "Cannot upload more than 3 image files",
            code: "409",
            data: {},
          })
        const totalFiles =
          productData.productImages.length + requestBody.product_images.length
        if (totalFiles > 3)
          return res.status(409).json({
            message: "Cannot upload additional image files",
            code: "409",
            data: {},
          })
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

      const productForPublishStatus = {
        ...productData,
        quantity: requestBody.quantity,
        featuredImage: featuredImage,
        description: requestBody.description,
        price: requestBody.price,
        region: requestBody.region,
        district: requestBody.district,
      }

      const canPublish = isPublishableProduct(productForPublishStatus)

      requestBody.publishing_status =
        !canPublish &&
        requestBody.publishing_status === ProductPublishingStatusEnum.PUBLISHED
          ? ProductPublishingStatusEnum.DRAFTED
          : requestBody.publishing_status

      // generate plain text from description (html) if provided
      let plainTextDescription: string | null = null
      if (requestBody.description) {
        plainTextDescription = generatePlainTextFromHtml(
          requestBody.description
        )
      }

      const updatedProduct = await Product.findByIdAndUpdate<
        PopulatedProductModel & mongoose.Document
      >(
        requestBody.product_id,
        {
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
          color:
            typeof requestBody.color === "string" ? requestBody.color : null,
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
          $push: {
            productImages: {
              $each: productImagesArray,
            },
          },
          isNegotiable:
            typeof requestBody.is_negotiable === "boolean"
              ? requestBody.is_negotiable
              : null,
          tags: Array.isArray(requestBody.tags) ? requestBody.tags : null,
          publishingStatus: requestBody.publishing_status,
        },
        { new: true }
      ).populate([
        {
          path: "vendorId",
          select: "-password -photoId -mfaActivated -mfaDisabledAt",
        },
        {
          path: "categoryId",
          select: "-categoryImageId",
        },
        {
          path: "subcategoryId",
        },
      ])
      if (!updatedProduct)
        return res
          .status(500)
          .json({ message: "Product update has failed", code: "500", data: {} })

      const {
        vendorId,
        categoryId,
        subcategoryId,
        featuredImageId: fId,
        productImages,
        ...product
      } = updatedProduct.toObject() as PopulatedProductModel

      // calculate discounted product
      const discountedPrice = discountCalculation({
        price: product.price,
        discount: product.discount,
      })

      const returnableData = {
        ...product,
        category: categoryId,
        vendor: vendorId,
        subcategory: subcategoryId,
        productImages: productImages.map((img) => img.productImageUrl),
        discountedPrice,
      }

      return res.status(200).json({
        message: "Product updated successfully",
        code: "200",
        data: { product: returnableData },
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
export default UpdateProduct
