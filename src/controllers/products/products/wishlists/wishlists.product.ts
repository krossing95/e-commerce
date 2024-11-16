import mongoose from "mongoose"
import {
  PopulatedProductModel,
  ProductModel,
} from "../../../../types/models/type.model.product"
import { discountCalculation } from "../../../../helpers/methods/method.on-product"

export const fetchProductAfterWishlistCreation = async (
  productData: ProductModel & mongoose.Document
) => {
  try {
    const potentialSendableProduct = (await productData.populate([
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
    ])) as PopulatedProductModel & mongoose.Document

    const {
      vendorId,
      categoryId,
      subcategoryId,
      featuredImageId: fId,
      productImages,
      ...restPoductInformation
    } = potentialSendableProduct.toObject() as PopulatedProductModel

    // calculate discounted price

    const discountedPrice = discountCalculation({
      price: restPoductInformation.price,
      discount: restPoductInformation.discount,
    })

    const returnableData = {
      ...restPoductInformation,
      category: categoryId,
      vendor: vendorId,
      subcategory: subcategoryId,
      productImages: productImages.map((img) => img.productImageUrl),
      discountedPrice,
    }

    return returnableData
  } catch (error) {
    return null
  }
}
