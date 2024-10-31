import mongoose from "mongoose"

export const productRatingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

const ProductRating =
  mongoose.models.ProductRating ||
  mongoose.model("ProductRating", productRatingSchema)

export default ProductRating
