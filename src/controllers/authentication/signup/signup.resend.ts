import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import User from "../../../models/model.user"
import { UserModel } from "../../../types/models/type.model.user"
import { v4 as genUUID } from "uuid"
import { encrypt } from "../../../helpers/methods/method.crypto"
import Verification from "../../../models/model.verification"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import useSignUpMailer from "../../../helpers/mail/authentication/mail.signup"
import mongoose from "mongoose"

export type ResendUserVerificationLinkPayload = {
  user_id: string
}

const ResendUserVerificationLink = async (req: Request, res: Response) => {
  const expected_payload = ["user_id"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  const requestBody: ResendUserVerificationLinkPayload = req.body

  try {
    // get user account
    const user = await User.findById<UserModel & mongoose.Document>(
      requestBody.user_id
    )

    if (!user)
      return res.status(404).json({
        message: "User not found",
        code: "404",
        data: {},
      })

    if (user.isVerified)
      return res.status(409).json({
        message: "User has been verified already",
        code: "409",
        data: {},
      })

    //   generate the verification link
    const code = genUUID()

    const encryptedCode = await encrypt(code)

    if (!encryptedCode) {
      await User.findByIdAndDelete(requestBody.user_id)
      return res.status(500).json({
        message: "Process has failed",
        code: "500",
        data: {},
      })
    }
    await Verification.deleteMany({ userId: requestBody.user_id })

    const verificationObject = new Verification({
      userId: user._id,
      code: encryptedCode,
      issuedAt: currentTimestamp(),
    })
    // save the verification and send verification link to the user through mail
    const [_, sendMail] = await Promise.all([
      verificationObject.save(),
      useSignUpMailer({
        id: user._id?.toString(),
        code,
        firstname: user.firstname,
        email: user.email,
      }),
    ])
    if (!sendMail) {
      return res.status(500).json({
        message: "Process has failed",
        code: "500",
        data: {},
      })
    }

    const { password, photoId, mfaDisabledAt, ...sendableUser } =
      user?.toObject()

    return res.status(200).json({
      message: "Link resent successfully",
      code: "200",
      data: { user: sendableUser },
    })
  } catch (error) {
    return res.status(500).json({
      message: "Whoops! Something went wrong",
      code: "500",
      data: {},
    })
  }
}
export default ResendUserVerificationLink
