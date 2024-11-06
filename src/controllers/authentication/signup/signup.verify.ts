import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { Regex } from "../../../lib/static/static.index"
import User from "../../../models/model.user"
import Verification from "../../../models/model.verification"
import { VerificationModel } from "../../../types/models/type.model.verification"
import { decrypt } from "../../../helpers/methods/method.crypto"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import { UserModel } from "../../../types/models/type.model.user"
import mongoose from "mongoose"

type UserVerificationPayload = {
  user_id: string
  code: string
}

const UserVerification = async (req: Request, res: Response) => {
  const expected_payload = ["code", "user_id"]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })

  const requestBody: UserVerificationPayload = req.body

  requestBody.code = requestBody.code.trim()

  if (!Regex.MONGOOBJECT.test(requestBody.user_id))
    return res
      .status(400)
      .json({ message: "Incorrect data", code: "400", data: {} })

  try {
    const [userData, verificationData] = await Promise.all([
      User.findById<{ isVerified: boolean }>({
        _id: requestBody.user_id,
      }).select({ isVerified: 1 }),
      Verification.findOne<VerificationModel>({
        userId: requestBody.user_id,
      }),
    ])
    if (!userData)
      return res.status(404).json({
        message: "User not found",
        code: "404",
        data: {},
      })

    if (!verificationData)
      return res
        .status(400)
        .json({ message: "Invalid verification link", code: "400", data: {} })

    if (userData.isVerified)
      return res.status(409).json({
        message: "User has been verified already",
        code: "409",
        data: {},
      })

    const decryptedDBCode = await decrypt(verificationData.code)
    if (!decryptedDBCode)
      return res
        .status(500)
        .json({ message: "Verification has failed", code: "500", data: {} })

    if (decryptedDBCode !== requestBody.code)
      return res
        .status(400)
        .json({ message: "Invalid verification link", code: "400", data: {} })

    const timestamp = currentTimestamp()

    if (timestamp - verificationData.issuedAt > 86400000)
      return res.status(403).json({
        message: "Verification link has expired",
        code: "403",
        data: {},
      })

    const payload: Partial<UserModel> = {
      isVerified: true,
    }

    const verify = (
      await User.findByIdAndUpdate<UserModel & mongoose.Document>(
        requestBody.user_id,
        {
          ...payload,
        },
        { new: true }
      )
    )?.toObject() as UserModel

    if (!verify)
      return res.status(500).json({
        message: "User verification has failed",
        code: "500",
        data: {},
      })

    await Verification.deleteMany({ userId: requestBody.user_id })

    const { password, photoId, mfaDisabledAt, ...sendableUser } = verify

    return res.status(200).json({
      message: "User verified successfully",
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
export default UserVerification
