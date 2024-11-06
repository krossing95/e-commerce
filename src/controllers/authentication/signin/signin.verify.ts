import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import Otp from "../../../models/model.otp"
import { OtpModel } from "../../../types/models/type.otp"
import User from "../../../models/model.user"
import { UserModel } from "../../../types/models/type.model.user"
import { decrypt, encrypt } from "../../../helpers/methods/method.crypto"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import { sign } from "jsonwebtoken"
import { Regex } from "../../../lib/static/static.index"
import mongoose from "mongoose"

type OtpVerificationPayload = {
  user_id: string
  otp: string
  disable_mfa: boolean
}

const OtpVerification = async (req: Request, res: Response) => {
  const expected_payload = ["user_id", "otp", "disable_mfa"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)

  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve request body
  const requestBody: OtpVerificationPayload = req.body
  try {
    if (!Regex.MONGOOBJECT.test(requestBody.user_id))
      return res
        .status(400)
        .json({ message: "No user found", code: "400", data: {} })
    // retrieve the opt and the user data
    const [otpData, userData] = await Promise.all([
      Otp.findOne<OtpModel>({
        userId: requestBody.user_id,
      }),
      User.findById<UserModel & mongoose.Document>(requestBody.user_id),
    ])

    if (!otpData || !userData)
      return res
        .status(400)
        .json({ message: "Incorrect OTP", code: "400", data: {} })

    const decryptedOtp = await decrypt(otpData.otp)

    if (!decryptedOtp)
      return res
        .status(500)
        .json({ message: "Otp verification has failed", code: "500", data: {} })

    if (decryptedOtp !== requestBody.otp)
      return res
        .status(400)
        .json({ message: "Incorrect OTP", code: "400", data: {} })

    const timestamp = currentTimestamp()
    if (timestamp - otpData.issuedAt > 1200000)
      return res.status(403).json({
        message: "OTP has expired",
        code: "403",
        data: {},
      })

    //   generate the login token

    const { password, photoId, mfaDisabledAt, ...loggableUser } =
      userData?.toObject() as UserModel

    const token: string | undefined = sign(
      { ...loggableUser },
      process.env.ECOM_JWT_SECRET as string,
      { expiresIn: process.env.ECOM_LOGIN_LONGEVITY }
    )
    if (!token)
      return res.status(500).json({
        message: "Whoops! Something went wrong",
        code: "500",
        data: {},
      })

    const encryptedToken = await encrypt(token)

    if (!encryptedToken)
      return res
        .status(500)
        .json({ message: "Login has failed", code: "500", data: {} })

    if (requestBody.disable_mfa) {
      const payload: Partial<UserModel> = {
        mfaActivated: true,
        mfaDisabledAt: timestamp,
      }
      await User.findByIdAndUpdate(
        requestBody.user_id,
        { ...payload },
        { new: true }
      )
    }

    await Otp.deleteMany({ userId: requestBody.user_id })

    return res.status(200).json({
      message: "Signed in successfully",
      code: "200",
      data: {
        user: loggableUser,
        resend_otp_token: null,
        token: encryptedToken,
        willVerifyMFACode: false,
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default OtpVerification
