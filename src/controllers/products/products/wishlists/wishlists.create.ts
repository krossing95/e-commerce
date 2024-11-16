import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../../helpers/request/helper.request"
import { Regex } from "../../../../lib/static/static.index"
import JwtDataExtractor from "../../../../middlewares/middleware.jwt-data"
import Product from "../../../../models/model.product"
import { ProductModel } from "../../../../types/models/type.model.product"
import mongoose from "mongoose"
import { ProductPublishingStatusEnum } from "../../../../lib/enum/enum.index"
import WishList from "../../../../models/model.wishlist"
import { WishListModel } from "../../../../types/models/type.model.wishlist"
import { fetchProductAfterWishlistCreation } from "./wishlists.product"

type CreateWishlistPayload = {
  product_id: string
}

const CreateWishlist = async (req: Request, res: Response) => {
  const expected_payload = ["product_id"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: CreateWishlistPayload = req.body

  if (!Regex.MONGOOBJECT.test(requestBody.product_id))
    return res
      .status(400)
      .json({ message: "Product ID is required", code: "400", data: {} })

  const productId = requestBody.product_id
  try {
    // retrieve the request.authorization data
    const tokenData = await JwtDataExtractor(req)
    const tokenDataObjKeys = Object.keys(tokenData)
    if (!tokenDataObjKeys.includes("_id"))
      return res
        .status(401)
        .json({ message: "Authorization is required", code: "401", data: {} })
    const tokenDataObject = tokenData as { _id: string; email: string }

    // retrieve the product
    // retrieve existing wishlist instance on the product and customer
    const [productData, exitingWishListItem] = await Promise.all([
      Product.findById<ProductModel & mongoose.Document>(productId),
      WishList.findOne<WishListModel & mongoose.Document>({
        customerId: tokenDataObject._id,
        productId,
      }),
    ])
    if (!productData)
      return res
        .status(404)
        .json({ message: "Product not found", code: "404", data: {} })

    if (
      productData.isDeleted ||
      productData.publishingStatus === ProductPublishingStatusEnum.DRAFTED
    )
      return res.status(403).json({
        message: "Cannot add the product to wishlist",
        code: "403",
        data: {},
      })

    if (exitingWishListItem) {
      await exitingWishListItem.deleteOne()

      const productInformation = await fetchProductAfterWishlistCreation(
        productData
      )
      return res.status(200).json({
        message: "Product removed from wishlist",
        code: "200",
        data: { product: productInformation },
      })
    }

    // create new wishlist instance on the product and user
    const newWishlistData = new WishList({
      customerId: tokenDataObject._id,
      productId,
    })

    await newWishlistData.save()

    const productInformation = await fetchProductAfterWishlistCreation(
      productData
    )
    return res.status(200).json({
      message: "Product added to wishlist",
      code: "200",
      data: { product: productInformation },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default CreateWishlist
