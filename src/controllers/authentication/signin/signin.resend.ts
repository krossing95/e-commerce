import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import JwtDataExtractor from "../../../middlewares/middleware.jwt-data"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import User from "../../../models/model.user"
import { UserModel } from "../../../types/models/type.model.user"
import Otp from "../../../models/model.otp"
import { encrypt } from "../../../helpers/methods/method.crypto"
import useSignInMailer from "../../../helpers/mail/authentication/mail.signin"
import mongoose from "mongoose"

type ResendOtpPayload = {
  resend_otp_token: string
}

type ResendOtpTokenPayload = {
  tk_id: string
  _id: string
  tk_exp: number
}

const ResendOtp = async (req: Request, res: Response) => {
  const expected_payload = ["resend_otp_token"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  const requestBody: ResendOtpPayload = req.body

  if (requestBody.resend_otp_token.length === 0)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })

  try {
    req.headers["authorization"] = `Bearer ${requestBody.resend_otp_token}`
    const tokenData = await JwtDataExtractor(req)

    if (!Object.keys(tokenData).includes("tk_exp"))
      return res.status(403).json({
        message: "Not eligible to request for OTP",
        code: "403",
        data: {},
      })

    const tokenDataObj = tokenData as ResendOtpTokenPayload

    const tk_exp = tokenDataObj.tk_exp

    const timestamp = currentTimestamp()
    if (timestamp > tk_exp)
      return res.status(403).json({
        message: "Forbidden: Try to login again",
        code: "403",
        data: {},
      })

    // retrieve the user

    const user = await User.findById<UserModel & mongoose.Document>(
      tokenDataObj._id
    )

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", code: "404", data: {} })

    if (tokenDataObj._id !== user._id.toString())
      return res.status(403).json({
        message: "Not eligible to request for OTP",
        code: "403",
        data: {},
      })

    // discard the otps registered on the user
    await Otp.deleteMany({ userId: tokenDataObj._id })

    let otp = ""
    while (otp.length !== 6) {
      otp = Math.floor(Math.random() * 999999 + 1).toString()
    }
    const encryptedOtp = await encrypt(otp)

    if (!encryptedOtp)
      return res
        .status(500)
        .json({ message: "Process has failed", code: "500", data: {} })

    const newOtp = new Otp({
      userId: user._id,
      otp: encryptedOtp,
      issuedAt: timestamp,
    })
    await Promise.all([
      newOtp.save(),
      useSignInMailer({
        firstname: user.firstname,
        email: user.email,
        otp,
      }),
    ])

    const { password, photoId, mfaDisabledAt, ...loggableUser } =
      user?.toObject()

    return res.status(200).json({
      message: "OTP resent successfully",
      code: "200",
      data: {
        user: loggableUser,
        resend_otp_token: requestBody.resend_otp_token,
        token: null,
        willVerifyMFACode: true,
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default ResendOtp
