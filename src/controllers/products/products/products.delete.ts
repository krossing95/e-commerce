import { Request, Response } from "express"
import { Regex } from "../../../lib/static/static.index"
import Product from "../../../models/model.product"
import {
  PopulatedProductModel,
  ProductModel,
} from "../../../types/models/type.model.product"
import mongoose from "mongoose"
import Sale from "../../../models/model.sale"
import { SaleModel } from "../../../types/models/type.model.sale"
import {
  ProductPublishingStatusEnum,
  UsertypeEnum,
} from "../../../lib/enum/enum.index"
import { discountCalculation } from "../../../helpers/methods/method.on-product"
import destroyImage from "../../../helpers/image_system/destroy"
import ProductReview from "../../../models/model.product-review"
import WishList from "../../../models/model.wishlist"
import JwtDataExtractor from "../../../middlewares/middleware.jwt-data"

const DeleteProduct = async (req: Request, res: Response) => {
  try {
    if (!req.query?.productId)
      return res
        .status(400)
        .json({ message: "Product ID is required", code: "400", data: {} })

    const productId = req.query?.productId as string
    if (!Regex.MONGOOBJECT.test(productId))
      return res
        .status(400)
        .json({ message: "Product ID is required", code: "400", data: {} })

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
    const [productData, productInSales] = await Promise.all([
      Product.findById<ProductModel & mongoose.Document>(productId),
      Sale.findOne<SaleModel & mongoose.Document>({ products: productId }),
    ])

    if (!productData)
      return res
        .status(404)
        .json({ message: "Product not found", code: "404", data: {} })

    // check if the product is for the vendor
    if (tokenDataObject.usertype === UsertypeEnum.VENDOR) {
      if (productData.vendorId.toString() !== tokenDataObject._id.toString())
        return res.status(403).json({
          message: "Access to the resource has been denied",
          code: "403",
          data: {},
        })
    }

    // check if the product has ever been sold

    if (productInSales) {
      // soft-delete the product
      const softDeleteProduct = await Product.findByIdAndUpdate<
        PopulatedProductModel & mongoose.Document
      >(
        productId,
        {
          isDeleted: true,
          publishingStatus: ProductPublishingStatusEnum.DRAFTED,
        },
        { new: true }
      ).populate([
        {
          path: "categoryId",
          select: "-categoryImageId",
        },
        {
          path: "subcategoryId",
        },
        {
          path: "vendorId",
          select: "-password -mfaActivated -mfaActivatedAt",
        },
      ])
      if (!softDeleteProduct)
        return res
          .status(404)
          .json({ message: "Product not found", code: "404", data: {} })

      const {
        categoryId,
        subcategoryId,
        featuredImageId,
        productImages,
        ...restProductInformation
      } = softDeleteProduct.toObject() as PopulatedProductModel

      // calculate discounted price

      const discountedPrice = discountCalculation({
        price: restProductInformation.price,
        discount: restProductInformation.discount,
      })

      const returnableProduct = {
        ...restProductInformation,
        category: categoryId,
        subcategory: subcategoryId,
        productImages: productImages.map((img) => img.productImageUrl),
        discountedPrice,
      }

      return res.status(200).json({
        message: "Product was partially deleted",
        code: "200",
        data: {
          product: returnableProduct,
          meta_data: {
            miscellaneous: [
              {
                name: "product_deletion",
                data: "The product has a sales history. To preserve its transactional records, it has been partially removed from active listings, ensuring it remains hidden from customer view.",
              },
            ],
          },
        },
      })
    }

    // permanently delete the product
    const detailedProduct = (await productData.populate([
      {
        path: "categoryId",
        select: "-categoryImageId",
      },
      {
        path: "subcategoryId",
      },
      {
        path: "vendorId",
        select: "-password -mfaActivated -mfaActivatedAt",
      },
    ])) as PopulatedProductModel & mongoose.Document

    const {
      categoryId,
      subcategoryId,
      featuredImageId,
      productImages,
      ...deletedProductInformation
    } = detailedProduct.toObject() as PopulatedProductModel

    // calculate discounted price

    const discountedPrice = discountCalculation({
      price: deletedProductInformation.price,
      discount: deletedProductInformation.discount,
    })

    const returnableDeletedProduct = {
      ...deletedProductInformation,
      category: categoryId,
      subcategory: subcategoryId,
      productImages: productImages.map((img) => img.productImageUrl),
      discountedPrice,
    }

    // delete the product
    // delete all reviews
    // delete from wishlists
    await Promise.all([
      productData.deleteOne(),
      ProductReview.deleteMany({ productId }),
      WishList.deleteMany({ productId }),
    ])

    // delete the associated images
    const imagelist = [
      productData.featuredImageId,
      ...productData.productImages.map((img) => img.productImageId),
    ].filter((photoId) => photoId !== null)

    if (imagelist.length > 0) {
      for (let i = 0; i < imagelist.length; i++) {
        const photoId = imagelist[i]
        await destroyImage(photoId)
      }
    }

    return res.status(200).json({
      message: "Product was permanently deleted",
      code: "200",
      data: {
        product: returnableDeletedProduct,
        meta_data: {
          miscellaneous: [
            {
              name: "product_deletion",
              data: "The product was deleted permanently along with related data",
            },
          ],
        },
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default DeleteProduct
