import mongoose from "mongoose"

export const cartSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
    },
  },
  { timestamps: true }
)

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema)
export default Cart
