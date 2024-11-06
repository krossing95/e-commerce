import mongoose from "mongoose"

export const otpSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  otp: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Number,
    required: true,
  },
})

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema)

export default Otp
