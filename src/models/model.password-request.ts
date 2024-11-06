import mongoose from "mongoose"

const passwordRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  code: {
    type: String,
    required: true,
  },
})

const PasswordRequest =
  mongoose.models.PasswordRequest ||
  mongoose.model("PasswordRequest", passwordRequestSchema)

export default PasswordRequest
