import { NextFunction } from "express"
import { CreatePaymentInformationPayload } from "../../../controllers/vendors/payment-informations/vendors.payment-information.create"
import { cleanExcessWhiteSpaces } from "../../../helpers/methods/method.string"
import { Banks, Regex } from "../../../lib/static/static.index"

export const usePaymentInformationCreationValidator = (
  data: CreatePaymentInformationPayload,
  next: NextFunction
) => {
  const { payment_account_name, payment_account_number, bank_name } = data

  if (cleanExcessWhiteSpaces(payment_account_name).length === 0)
    return { error: "Account name is required" }

  const banks = Banks.map((bank) => bank.bankName)

  if (!banks.includes(bank_name))
    return { error: "Choose from our predefined banks" }

  if (cleanExcessWhiteSpaces(payment_account_number).length === 0)
    return { error: "Account number is required" }

  if (!Regex.NUMERICAL.test(payment_account_number))
    return { error: "Provide numerical entity for account number" }

  if (payment_account_number.length < 8 || payment_account_number.length > 20)
    return {
      error: "Account number must be a number that is 8 - 20 chars. long",
    }

  next()
}
