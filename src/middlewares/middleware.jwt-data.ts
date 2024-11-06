import { Request } from "express"
import { verify } from "jsonwebtoken"
import { decrypt } from "../helpers/methods/method.crypto"

const JwtDataExtractor = async (req: Request) => {
  const authorizer = req.headers["authorization"]
  let tokenData = {}
  if (typeof authorizer === "undefined") return tokenData
  const bearer = authorizer.split(" ", 2)
  if (bearer.length !== 2) return tokenData
  if (!bearer[1]) return tokenData

  try {
    const decryptedToken = await decrypt(bearer[1])
    if (!decryptedToken) return tokenData

    const verifyToken = verify(
      decryptedToken,
      process.env.ECOM_JWT_SECRET as string
    )

    tokenData = verifyToken

    return tokenData
  } catch (error) {
    return tokenData
  }
}
export default JwtDataExtractor
