import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import User from "../../../models/model.user"
import { UserModel } from "../../../types/models/type.model.user"
import { Regex } from "../../../lib/static/static.index"
import { v4 as genUUID } from "uuid"
import Verification from "../../../models/model.verification"
import { currentTimestamp } from "../../../helpers/methods/method.date"
import { encrypt } from "../../../helpers/methods/method.crypto"
import useSignUpMailer from "../../../helpers/mail/authentication/mail.signup"

export type CreateUserUsingGooglePayload = {
  email: string
  name: string
}

const CreateUserUsingGoogle = async (req: Request, res: Response) => {
  const expected_payload = ["name", "email"]
  // check for true request body structure
  const truePayload = isTrueBodyStructure(req.body, expected_payload)
  if (!truePayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // fetch the request body
  const requestBody: CreateUserUsingGooglePayload = req.body
  // trim email address
  requestBody.email = requestBody.email.trim()

  // validate the email address

  if (!Regex.EMAIL.test(requestBody.email))
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })

  try {
    const getEmailInstance = await User.findOne<UserModel>({
      email: requestBody.email,
    })

    if (getEmailInstance)
      return res.status(409).json({
        message: "Email address is already taken",
        code: "409",
        data: {},
      })

    // save the user
    const newUser = new User({
      firstname: requestBody.name,
      email: requestBody.email,
      isSocial: true,
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
        firstname: requestBody.name,
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
    return res.status(201).json({
      message: "User created successfully",
      code: "201",
      data: { user: createdUser },
    })
  } catch (error) {
    return res.status(500).json({
      message: "Whoops! Something went wrong",
      code: "500",
      data: {},
    })
  }
}
export default CreateUserUsingGoogle
