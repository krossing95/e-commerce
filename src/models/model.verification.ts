import mongoose from "mongoose"

export const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  code: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Number,
    required: true,
  },
})

const Verification =
  mongoose.models.Verification ||
  mongoose.model("Verification", verificationSchema)

export default Verification
