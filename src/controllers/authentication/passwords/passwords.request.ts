import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { Regex } from "../../../lib/static/static.index"
import { UserModel } from "../../../types/models/type.model.user"
import User from "../../../models/model.user"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import { encrypt } from "../../../helpers/methods/method.crypto"
import PasswordRequest from "../../../models/model.password-request"
import usePasswordRequestMailer from "../../../helpers/mail/authentication/mail.password-reset"

type RequestPasswordResetLinkPayload = {
  email: string
}

const RequestPasswordResetLink = async (req: Request, res: Response) => {
  const expected_payload = ["email"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  const requestBody: RequestPasswordResetLinkPayload = req.body

  try {
    if (!Regex.EMAIL.test(requestBody.email))
      return res
        .status(400)
        .json({ message: "Incorrect email address", code: "400", data: {} })

    // retrieve user by email address
    const user: UserModel | null = (
      await User.findOne({
        email: requestBody.email,
        isDeleted: false,
        isSocial: false,
      })
    )?.toObject()

    if (!user)
      return res.status(404).json({
        message: "User not found",
        code: "404",
        data: {},
      })
    const code = JSON.stringify({
      userId: user._id.toString(),
      issuedAt: currentTimestamp(),
    })
    const encryptedCode = await encrypt(code)

    if (!encryptedCode)
      return res
        .status(500)
        .json({ message: "Process has failed", code: "500", data: {} })

    await PasswordRequest.deleteMany({ userId: user._id })

    // create password reset link reset
    const newPasswordRequest = new PasswordRequest({
      userId: user._id,
      code: encryptedCode,
    })
    await newPasswordRequest.save()

    const link = `${process.env.ECOM_CLIENT_URL}auth/password-reset/reset?entity=${encryptedCode}`
    await usePasswordRequestMailer({
      firstname: user.firstname,
      email: user.email,
      link,
    })

    const { password, photoId, mfaDisabledAt, ...sendableUser } = user

    return res.status(200).json({
      message: "Password reset link is sent to you",
      code: "200",
      data: { user: sendableUser },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default RequestPasswordResetLink
