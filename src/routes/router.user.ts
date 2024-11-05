import express, { Request, Response } from "express"
import CreateUserUsingGoogle from "../controllers/authentication/signup/signup.google"
import { ConnectionMiddleware } from "../middlewares/middleware.connection"

const userRouter = express.Router()

userRouter.post(
  "/create/use-google",
  ConnectionMiddleware,
  CreateUserUsingGoogle
)

export default userRouter
