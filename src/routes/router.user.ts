import express from "express"
import CreateUser from "../controllers/authentication/signup/signup.create"

const userRouter = express.Router()

userRouter.post("/create", CreateUser)

export default userRouter
