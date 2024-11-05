import { NextFunction, Request, Response } from "express"
import { connection } from "../configs/mongodb/mongodb.config"

export const ConnectionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  connection()
  next()
}
