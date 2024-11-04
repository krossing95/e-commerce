import mongoose from "mongoose"

export const productReviewSchema = new mongoose.Schema(
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
    },
    review: {
      type: String,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)
const ProductReview =
  mongoose.models.ProductReview ||
  mongoose.model("ProductReview", productReviewSchema)

export default ProductReview
