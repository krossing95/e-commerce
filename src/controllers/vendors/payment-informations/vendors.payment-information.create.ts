import { Request, Response } from "express"
import { isTrueBodyStructure } from "../../../helpers/request/helper.request"
import { usePaymentInformationCreationValidator } from "../../../validators/vendors/payment-information/validator.create-payment-information"
import JwtDataExtractor from "../../../middlewares/middleware.jwt-data"
import { UserModel } from "../../../types/models/type.model.user"
import { UsertypeEnum } from "../../../lib/enum/enum.index"
import PaymentInformation from "../../../models/model.payment-information"
import { PaymentInformationModel } from "../../../types/models/type.model.payment-information"
import mongoose from "mongoose"
import { Banks } from "../../../lib/static/static.index"

export type CreatePaymentInformationPayload = {
  payment_account_name: string
  payment_account_number: string
  bank_name: string
}

const CreatePaymentInformation = async (req: Request, res: Response) => {
  const expected_payload = [
    "payment_account_name",
    "payment_account_number",
    "bank_name",
  ]
  const checkPayload = isTrueBodyStructure(req.body, expected_payload)
  if (!checkPayload)
    return res
      .status(400)
      .json({ message: "Bad request", code: "400", data: {} })
  // retrieve the request body
  const requestBody: CreatePaymentInformationPayload = req.body

  const validate = usePaymentInformationCreationValidator(
    requestBody,
    async () => {
      try {
        // retrieve the request.authorization data
        const tokenData = await JwtDataExtractor(req)
        const tokenDataObjKeys = Object.keys(tokenData)
        if (!tokenDataObjKeys.includes("_id"))
          return res.status(401).json({
            message: "Authorization is required",
            code: "401",
            data: {},
          })
        const tokenDataObject = tokenData as UserModel

        if (tokenDataObject.usertype !== UsertypeEnum.VENDOR)
          return res.status(403).json({
            message: "Only vendors are allowed to add payment information",
            code: "403",
            data: {},
          })

        //   get provided bank details
        const bank = Banks.filter(
          (bank) => bank.bankName === requestBody.bank_name
        )

        if (bank.length === 0)
          return res.status(400).json({
            message: "Choose from our predefined banks",
            code: "400",
            data: {},
          })

        const bankData = bank[0]

        // retrieve the vendor's payment information
        const [paymentInformation, accountNumberExists] = await Promise.all([
          PaymentInformation.find<PaymentInformationModel & mongoose.Document>({
            vendorId: tokenDataObject._id,
          }),
          PaymentInformation.findOne<
            PaymentInformationModel & mongoose.Document
          >({
            vendorId: tokenDataObject._id,
            paymentAccountNumber: requestBody.payment_account_number,
          }),
        ])

        if (paymentInformation.length === 2)
          return res.status(403).json({
            message: "Cannot register more than 2 payment accounts",
            code: "403",
            data: {},
          })

        // check if the provided account number exists in existing account numbers

        if (accountNumberExists)
          return res.status(409).json({
            message: "Payment account number already added",
            code: "409",
            data: {},
          })

        const newPaymentInformation = new PaymentInformation({
          vendorId: tokenDataObject._id,
          paymentAccountType: bankData.bankType,
          bankName: bankData.bankName,
          paymentAccountName: requestBody.payment_account_name,
          paymentAccountNumber: requestBody.payment_account_number,
        })

        await newPaymentInformation.save()

        const createdPaymentInformation = await PaymentInformation.findById<
          PaymentInformationModel & mongoose.Document
        >(newPaymentInformation?._id)

        if (!createdPaymentInformation)
          return res.status(500).json({
            message: "Payment information creation has failed",
            code: "500",
            data: {},
          })

        return res.status(201).json({
          message: "Payment information created",
          code: "201",
          data: { paymentInformation: createdPaymentInformation.toObject() },
        })
      } catch (error) {
        return res.status(500).json({
          message: "Whoops! Something went wrong",
          code: "500",
          data: {},
        })
      }
    }
  )

  if (validate !== undefined)
    return res
      .status(400)
      .json({ message: validate.error, code: "400", data: {} })
}
export default CreatePaymentInformation
