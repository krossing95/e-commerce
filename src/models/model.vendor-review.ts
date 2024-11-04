import mongoose from "mongoose"

export const vendorReviewSchema = new mongoose.Schema(
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
const VendorReview =
  mongoose.models.VendorReview ||
  mongoose.model("VendorReview", vendorReviewSchema)

export default VendorReview
