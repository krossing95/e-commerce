import { NextFunction, Request, Response } from "express"
import JwtDataExtractor from "./middleware.jwt-data"
import { UserModel } from "../types/models/type.model.user"
import { UsertypeEnum } from "../lib/enum/enum.index"
import { connection } from "../configs/mongodb/mongodb.config"

const VendorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData = await JwtDataExtractor(req)
    const tokenDataObjectKeys = Object.keys(tokenData)
    if (!tokenDataObjectKeys.includes("_id"))
      return res
        .status(401)
        .json({ message: "Authentication is required", code: "401", data: {} })

    const userData = tokenData as UserModel
    if (userData.usertype !== UsertypeEnum.VENDOR)
      return res
        .status(403)
        .json({ message: "Cannot access the resource", code: "403", data: {} })

    connection()
    next()
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Whoops! Something went wrong", code: "500", data: {} })
  }
}
export default VendorMiddleware
