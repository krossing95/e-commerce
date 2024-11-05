import mongoose from "mongoose"
import { GenderEnum, UsertypeEnum } from "../lib/enum/enum.index"

export const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    usertype: {
      type: String,
      enum: UsertypeEnum,
      default: UsertypeEnum.CUSTOMER,
    },
    gender: {
      type: String,
      enum: GenderEnum,
      default: GenderEnum.UNKNOWN,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
    },
    photoUrl: String,
    photoId: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSocial: {
      type: Boolean,
      default: false,
    },
    mfaActivated: {
      type: Boolean,
      default: false,
    },
    mfaDisabledAt: {
      type: Number,
    },
  },
  { timestamps: true }
)

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User
