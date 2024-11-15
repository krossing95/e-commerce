import mongoose from "mongoose"

export const saleSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
    },
    totalCost: {
      type: Number,
      required: true,
    },
    isWithdrawn: {
      type: Boolean,
      default: false,
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

const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema)

export default Sale
