import { Request, Response } from "express"

export type CreateUserUsingEmailPasswordPayload = {
  firstname: string
  lastname: string
  username: string
  email: string
  phone: string
  password: string
}

const CreateUserUsingEmailPassword = async (req: Request, res: Response) => {}
export default CreateUserUsingEmailPassword
