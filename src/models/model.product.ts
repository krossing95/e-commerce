import mongoose from "mongoose"

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
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
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
    town: {
      type: String,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    featuredImageId: {
      type: String,
      required: true,
    },
    productImages: {
      type: [
        {
          productImageUrl: { type: String, required: true },
          productImageId: { type: String, required: true },
        },
      ],
    },
    isNegotiable: {
      type: Boolean,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product
