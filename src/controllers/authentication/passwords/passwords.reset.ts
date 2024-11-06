import { Request, Response } from "express"
import { genSaltSync, hashSync } from "bcrypt"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { Regex } from "../../../lib/static/static.index"
import { decrypt } from "../../../helpers/methods/method.crypto"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import PasswordRequest from "../../../models/model.password-request"
import { PasswordRequestModel } from "../../../types/models/type.model.password-request"
import mongoose from "mongoose"
import { UserModel } from "../../../types/models/type.model.user"
import User from "../../../models/model.user"

type ResetPasswordPayload = {
  newPassword: string
  entity: string
}

const ResetPassword = async (req: Request, res: Response) => {
  const SALT = genSaltSync(10)
  const expected_payload = ["newPassword", "entity"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  const requestBody: ResetPasswordPayload = req.body
  try {
    if (
      !Regex.PASSWORD.test(requestBody.newPassword) ||
      requestBody.newPassword.length < 6
    )
      return res.status(400).json({
        message:
          "Password must be at least 6 characters & contain a combination of uppercase, lowercase alphanumeric and special characters",
        code: "400",
        data: {},
      })
    const decryptedEntity = await decrypt(requestBody.entity)

    if (!decryptedEntity)
      return res
        .status(500)
        .json({ message: "Password reset has failed", code: "500", data: {} })

    const entityObject = JSON.parse(decryptedEntity) as {
      userId: string
      issuedAt: number
    }

    const timestamp = currentTimestamp()
    if (timestamp - entityObject.issuedAt > 3600000)
      return res
        .status(403)
        .json({ message: "The link has expired", code: "403", data: {} })

    // get password reset props
    const passwordResetData = await PasswordRequest.findOne<
      PasswordRequestModel & mongoose.Document
    >({
      userId: entityObject.userId,
    })

    if (!passwordResetData)
      return res
        .status(404)
        .json({ message: "Data not found", code: "404", data: {} })

    const decryptedDBEntity = await decrypt(passwordResetData.code)

    if (!decryptedDBEntity)
      return res
        .status(500)
        .json({ message: "Password reset has failed", code: "500", data: {} })

    const dbentityObject = JSON.parse(decryptedDBEntity) as {
      userId: string
      issuedAt: number
    }
    if (timestamp - dbentityObject.issuedAt > 3600000)
      return res
        .status(403)
        .json({ message: "The link has expired", code: "403", data: {} })

    const hashedPassword = hashSync(requestBody.newPassword, SALT)

    const payload: Partial<UserModel> = {
      password: hashedPassword,
    }

    const user = (
      await User.findByIdAndUpdate<UserModel & mongoose.Document>(
        entityObject.userId,
        { ...payload },
        { new: true }
      )
    )?.toObject()

    const { password, photoId, mfaDisabledAt, ...sendableUser } = user

    await PasswordRequest.deleteMany({ userId: entityObject.userId })

    return res.status(200).json({
      message: "Password reset was successful",
      code: "200",
      data: { user: sendableUser },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default ResetPassword
