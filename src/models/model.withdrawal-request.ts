import mongoose from "mongoose"
import { WithdrawalRequestStatusEnum } from "../lib/enum/enum.index"

const withdrawalRequestSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sales: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Sale",
      required: true,
    },
    withdrawalRequestCode: {
      type: String,
    },
    withdrawalRequestStatus: {
      type: String,
      enum: WithdrawalRequestStatusEnum,
      default: WithdrawalRequestStatusEnum.PENDING,
    },
    creditedAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

const WithdrawalRequest =
  mongoose.models.WithdrawalRequest ||
  mongoose.model("WithdrawalRequest", withdrawalRequestSchema)

export default WithdrawalRequest
