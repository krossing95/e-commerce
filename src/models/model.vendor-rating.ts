import mongoose from "mongoose"

export const vendorRatingSchema = new mongoose.Schema(
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
      required: true,
    },
  },
  { timestamps: true }
)
const VendorRating =
  mongoose.models.VendorRating ||
  mongoose.model("VendorRating", vendorRatingSchema)

export default VendorRating
