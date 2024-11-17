import mongoose from "mongoose"
import { PaymentInformationType } from "../lib/enum/enum.index"

export const paymentInformationSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentAccountType: {
      type: String,
      enum: PaymentInformationType,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    paymentAccountName: {
      type: String,
      required: true,
    },
    paymentAccountNumber: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const PaymentInformation =
  mongoose.models.PaymentInformation ||
  mongoose.model("PaymentInformation", paymentInformationSchema)

export default PaymentInformation
