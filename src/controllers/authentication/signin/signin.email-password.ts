import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { UserModel } from "../../../types/models/type.model.user"
import User from "../../../models/model.user"
import { compareSync } from "bcrypt"
import { checkMfaEligibility } from "../../../helpers/methods/method.check-mfa-disability"
import { login } from "./signin.google"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import { encrypt } from "../../../helpers/methods/method.crypto"
import { ObjectId } from "bson"
import { sign } from "jsonwebtoken"
import Otp from "../../../models/model.otp"
import useSignInMailer from "../../../helpers/mail/authentication/mail.signin"

type LoginUsingEmailPasswordPayload = {
  email: string
  password: string
}

const LoginUsingEmailPassword = async (req: Request, res: Response) => {
  const expected_payload = ["email", "password"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: LoginUsingEmailPasswordPayload = req.body

  try {
    const user: UserModel | null = (
      await User.findOne({
        email: requestBody.email,
        isDeleted: false,
        isSocial: false,
      })
    )?.toObject()

    if (!user)
      return res
        .status(404)
        .json({ message: "Please sign up to continue", code: "404", data: {} })

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "User is not verified", code: "403", data: {} })

    // check password

    if (!user.password)
      return res.status(400).json({
        message: "Incorrect login credentials",
        code: "400",
        data: {},
      })

    const comparePassword = compareSync(requestBody.password, user.password)
    if (!comparePassword)
      return res.status(400).json({
        message: "Incorrect login credentials",
        code: "400",
        data: {},
      })

    // check mfa eligibility
    const mfaData = checkMfaEligibility(user.mfaActivated, user.mfaDisabledAt)

    const { password, photoId, mfaDisabledAt, ...loggableUser } = user

    if (!mfaData.useMfa) return await login(loggableUser, res)

    const timestamp = currentTimestamp()

    // continue otp resend token generation
    let resendToken: string | undefined = sign(
      {
        tk_id: new ObjectId().toString(),
        _id: (user._id as string)?.toString(),
        tk_exp: timestamp + 1200000,
      },
      process.env.ECOM_JWT_SECRET as string,
      { expiresIn: "1h" }
    )

    resendToken = !resendToken ? "" : resendToken

    const encryptedResendToken = await encrypt(resendToken)

    if (!encryptedResendToken)
      return res
        .status(500)
        .json({ message: "Login has failed", code: "500", data: {} })

    // process OTP and send to user
    await Otp.deleteMany({ userId: user._id })
    let otp = ""
    while (otp.length !== 6) {
      otp = Math.floor(Math.random() * 999999 + 1).toString()
    }
    const encryptedOtp = await encrypt(otp)

    if (!encryptedOtp)
      return res
        .status(500)
        .json({ message: "Login has failed", code: "500", data: {} })

    // create new otp instance
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
    return res.status(200).json({
      message: "Credentials checked successfully",
      code: "200",
      data: {
        user: loggableUser,
        resend_otp_token: encryptedResendToken,
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
export default LoginUsingEmailPassword
