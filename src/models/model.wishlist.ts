import mongoose from "mongoose"

export const wishlistSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
)

const WishList =
  mongoose.models.WishList || mongoose.model("WishList", wishlistSchema)
export default WishList
