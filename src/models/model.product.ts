import mongoose from "mongoose"
import { ProductPublishingStatusEnum } from "../lib/enum/enum.index"

export const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductSubcategory",
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
    },
    quantitySold: {
      type: Number,
    },
    price: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    color: {
      type: String,
    },
    description: {
      type: String,
    },
    plainTextDescription: {
      type: String,
    },
    region: {
      type: String,
    },
    district: {
      type: String,
    },
    featuredImage: {
      type: String,
    },
    featuredImageId: {
      type: String,
    },
    productImages: {
      type: [
        {
          productImageUrl: { type: String, required: true },
          productImageId: { type: String, required: true },
        },
      ],
      default: [],
    },
    publishingStatus: {
      type: String,
      enum: ProductPublishingStatusEnum,
      default: ProductPublishingStatusEnum.DRAFTED,
    },
    isNegotiable: {
      type: Boolean,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
)

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product
