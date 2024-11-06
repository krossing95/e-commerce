import { genSaltSync, hashSync } from "bcrypt"
import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import useSignUpValidation from "../../../validators/authentication/validator.signup-email"
import {
  cleanExcessWhiteSpaces,
  joinTextsWithNoSpaces,
} from "../../../helpers/methods/method.string"
import User from "../../../models/model.user"
import { UserModel } from "../../../types/models/type.model.user"
import Verification from "../../../models/model.verification"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import useSignUpMailer from "../../../helpers/mail/authentication/mail.signup"
import { encrypt } from "../../../helpers/methods/method.crypto"
import { v4 as genUUID } from "uuid"

export type CreateUserUsingEmailPasswordPayload = {
  firstname: string
  lastname: string | null
  username: string | null
  email: string
  phone: string | null
  password: string
}

const CreateUserUsingEmailPassword = async (req: Request, res: Response) => {
  const SALT = genSaltSync(10)
  const expected_payload = [
    "firstname",
    "email",
    "password",
    "lastname",
    "username",
    "phone",
  ]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  const requestBody: CreateUserUsingEmailPasswordPayload = req.body

  const validate = useSignUpValidation(requestBody, async () => {
    try {
      requestBody.email = requestBody.email.trim()
      requestBody.password = hashSync(requestBody.password, SALT)
      requestBody.phone = !requestBody.phone
        ? null
        : cleanExcessWhiteSpaces(requestBody.phone)
      requestBody.username = !requestBody.username
        ? null
        : joinTextsWithNoSpaces(requestBody.username)

      const getUserInstance = await User.findOne<UserModel>({
        $or: [
          { email: requestBody.email },
          ...(requestBody.username ? [{ username: requestBody.username }] : []),
          ...(requestBody.phone ? [{ phone: requestBody.phone }] : []),
        ],
      })

      if (getUserInstance)
        return res.status(409).json({
          message: "Email or username or phone is already taken",
          code: "409",
          data: {},
        })

      // save the user
      const newUser = new User({
        ...requestBody,
        isSocial: false,
      })

      const createdUser = await newUser.save()

      // save verification details
      const code = genUUID()

      const encryptedCode = await encrypt(code)

      if (!encryptedCode) {
        await User.findByIdAndDelete(createdUser._id)
        return res.status(500).json({
          message: "User registration has failed",
          code: "500",
          data: {},
        })
      }
      await Verification.deleteMany({ userId: createdUser._id })
      const verificationObject = new Verification({
        userId: createdUser._id,
        code: encryptedCode,
        issuedAt: currentTimestamp(),
      })
      // save the verification and send verification link to the user through mail
      const [_, sendMail] = await Promise.all([
        verificationObject.save(),
        useSignUpMailer({
          id: createdUser._id?.toString(),
          code,
          firstname: requestBody.firstname,
          email: requestBody.email,
        }),
      ])
      if (!sendMail) {
        await User.findByIdAndDelete(createdUser._id)
        await Verification.findOneAndDelete({ userId: createdUser._id })
        return res.status(500).json({
          message: "User registration has failed",
          code: "500",
          data: {},
        })
      }

      const { password, photoId, mfaDisabledAt, ...sendableUser } =
        createdUser?.toObject()

      return res.status(201).json({
        message: "User created successfully",
        code: "201",
        data: { user: sendableUser },
      })
    } catch (error) {
      return res.status(500).json({
        message: "Whoops! Something went wrong",
        code: "500",
        data: {},
      })
    }
  })

  if (validate !== undefined)
    return res
      .status(400)
      .json({ message: validate.error, code: "400", data: {} })
}
export default CreateUserUsingEmailPassword
