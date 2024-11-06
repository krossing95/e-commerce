import express from "express"
import CreateUserUsingGoogle from "../controllers/authentication/signup/signup.google"
import { ConnectionMiddleware } from "../middlewares/middleware.connection"
import CreateUserUsingEmailPassword from "../controllers/authentication/signup/signup.email-password"
import ResendUserVerificationLink from "../controllers/authentication/signup/signup.resend"
import UserVerification from "../controllers/authentication/signup/signup.verify"
import LoginUsingGoogle from "../controllers/authentication/signin/signin.google"
import ResendOtp from "../controllers/authentication/signin/signin.resend"
import LoginUsingEmailPassword from "../controllers/authentication/signin/signin.email-password"
import OtpVerification from "../controllers/authentication/signin/signin.verify"
import RequestPasswordResetLink from "../controllers/authentication/passwords/passwords.request"
import ResetPassword from "../controllers/authentication/passwords/passwords.reset"

const userRouter = express.Router()

userRouter.post(
  "/create/use-google",
  ConnectionMiddleware,
  CreateUserUsingGoogle
)
userRouter.post(
  "/create/use-email-password",
  ConnectionMiddleware,
  CreateUserUsingEmailPassword
)
userRouter.post(
  "/create/resend-link",
  ConnectionMiddleware,
  ResendUserVerificationLink
)
userRouter.patch("/create/verify-user", ConnectionMiddleware, UserVerification)
// login routes
userRouter.post("/login/use-google", ConnectionMiddleware, LoginUsingGoogle)
userRouter.post(
  "/login/use-email-password",
  ConnectionMiddleware,
  LoginUsingEmailPassword
)
userRouter.post("/login/resend-otp", ConnectionMiddleware, ResendOtp)
userRouter.post("/login/verify-otp", ConnectionMiddleware, OtpVerification)

userRouter.post(
  "/password-reset/request-link",
  ConnectionMiddleware,
  RequestPasswordResetLink
)
userRouter.patch("/password-reset/reset", ConnectionMiddleware, ResetPassword)
export default userRouter
