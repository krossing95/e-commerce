import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { Regex } from "../../../lib/static/static.index"
import JwtDataExtractor from "../../../middlewares/middleware.jwt-data"
import Product from "../../../models/model.product"
import {
  PopulatedProductModel,
  ProductModel,
} from "../../../types/models/type.model.product"
import mongoose from "mongoose"
import {
  ProductPublishingStatusEnum,
  UsertypeEnum,
} from "../../../lib/enum/enum.index"
import destroyImage from "../../../helpers/image_system/destroy"
import { discountCalculation } from "../../../helpers/methods/method.on-product"

type DeleteProductPhotosPayload = {
  product_id: string
  target_photo_urls: string[]
}

const DeleteProductPhotos = async (req: Request, res: Response) => {
  const expected_payload = ["product_id", "target_photo_urls"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: DeleteProductPhotosPayload = req.body
  if (!Regex.MONGOOBJECT.test(requestBody.product_id))
    return res
      .status(400)
      .json({ message: "Product ID is required", code: "400", data: {} })
  if (!Array.isArray(requestBody.target_photo_urls))
    return res.status(400).json({
      message: "Provide a list of URL of photos to remove from product",
      code: "400",
      data: {},
    })

  if (!requestBody.target_photo_urls.length)
    return res.status(400).json({
      message: "Provide a list of URL of photos to remove from product",
      code: "400",
      data: {},
    })

  try {
    // retrieve the request.authorization data
    const tokenData = await JwtDataExtractor(req)
    const tokenDataObjKeys = Object.keys(tokenData)
    if (!tokenDataObjKeys.includes("_id"))
      return res
        .status(401)
        .json({ message: "Authorization is required", code: "401", data: {} })
    const tokenDataObject = tokenData as {
      _id: string
      email: string
      usertype: string
    }

    // retrieve the product
    const productData = await Product.findById<
      ProductModel & mongoose.Document
    >(requestBody.product_id)

    if (!productData)
      return res
        .status(404)
        .json({ message: "Product not found", code: "404", data: {} })

    // check if the product is for the vendor
    if (
      tokenDataObject.usertype === UsertypeEnum.VENDOR &&
      productData.vendorId.toString() !== tokenDataObject._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied: You do not own this product",
        code: "403",
        data: {},
      })
    }

    // check if the urls provided are associated to the product
    const allProductPhotos = [
      {
        photoId: productData.featuredImageId,
        photoUrl: productData.featuredImage,
        isFeatured: true,
      },
      ...productData.productImages.map((img) => ({
        photoId: img.productImageId,
        photoUrl: img.productImageUrl,
        isFeatured: false,
      })),
    ]
    let allPhotosExists = true
    let deletablePhotoData: { photoId: string | null; isFeatured: boolean }[] =
      []
    for (let i = 0; i < requestBody.target_photo_urls.length; i++) {
      const url = requestBody.target_photo_urls[i]
      const productPhoto = allProductPhotos.filter(
        (img) => img.photoUrl === url
      )?.[0]

      if (!productPhoto) allPhotosExists = false

      deletablePhotoData = [
        ...deletablePhotoData,
        {
          photoId: productPhoto?.photoId,
          isFeatured: productPhoto?.isFeatured,
        },
      ]
    }
    if (!allPhotosExists || deletablePhotoData.length === 0)
      return res.status(400).json({
        message:
          "One or more provided photo URLs are not associated to the product",
        code: "400",
        data: {},
      })

    const deletablePhotoIds = deletablePhotoData
      .map((photo) => photo?.photoId)
      .filter((_) => _ !== null)

    if (deletablePhotoIds.length !== requestBody.target_photo_urls.length)
      return res.status(400).json({
        message:
          "One or more provided photo URLs are not associated to the product",
        code: "400",
        data: {},
      })

    const isRemovingFeaturedPhoto = deletablePhotoData.some(
      (photo) => photo?.isFeatured
    )

    const updatedProduct = await Product.findByIdAndUpdate<
      PopulatedProductModel & mongoose.Document
    >(
      requestBody.product_id,
      {
        $pull: {
          productImages: { productImageId: { $in: deletablePhotoIds } },
        },
        $set: {
          featuredImage: isRemovingFeaturedPhoto
            ? null
            : productData.featuredImage,
          featuredImageId: isRemovingFeaturedPhoto
            ? null
            : productData.featuredImageId,
          publishingStatus: isRemovingFeaturedPhoto
            ? ProductPublishingStatusEnum.DRAFTED
            : productData.publishingStatus,
        },
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
      return res.status(500).json({
        message: "Product photo removal failed",
        code: "500",
        data: {},
      })

    await Promise.all(
      deletablePhotoIds.map((photoId) => destroyImage(photoId!))
    )

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
      message: "Product photos removed successfully",
      code: "200",
      data: { product: returnableData },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default DeleteProductPhotos
