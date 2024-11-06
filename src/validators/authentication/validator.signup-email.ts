import { NextFunction } from "express"
import { Regex } from "../../lib/static/static.index"
import { CreateUserUsingEmailPasswordPayload } from "../../controllers/authentication/signup/signup.email-password"
import { cleanExcessWhiteSpaces } from "../../helpers/methods/method.string"

const useSignUpValidation = (
  data: CreateUserUsingEmailPasswordPayload,
  next: NextFunction
) => {
  const { firstname, lastname, username, email, phone, password } = data

  // required fields

  if (!Regex.EMAIL.test(email)) return { error: "Incorrect email address" }

  if (!Regex.PASSWORD.test(password))
    return {
      error:
        "Password must contain a combination of uppercase, lowercase alphanumeric and special characters",
    }
  if (password.length < 6)
    return {
      error: "Password must contain at least 6 characters",
    }

  const refinedFirstname = cleanExcessWhiteSpaces(firstname)
  if (refinedFirstname.length === 0)
    return { error: "Firstname field is required" }

  if (username) {
    if (!Regex.USERNAME.test(username))
      return {
        error:
          "Username must contain only alphanumeric, either a hyphen or an underscore and no whitespaces",
      }

    if (username.length < 1) return { error: "Username is required" }
  }

  if (phone) {
    if (
      !Regex.NUMERICAL.test(phone) ||
      phone.length < 10 ||
      phone.length > 13 ||
      phone.charAt(0) !== "0"
    )
      return {
        error:
          "Phone number should be numerical string of 10 - 13 digits starting with 0",
      }
  }

  next()
}
export default useSignUpValidation
