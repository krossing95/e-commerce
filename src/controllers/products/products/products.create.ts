import { Request, Response } from "express"

export type CreateProductPayload = {
  categoryId: string
  productName: string
  quantity: number
  price: number
}

const CreateProduct = async (req: Request, res: Response) => {}
export default CreateProduct
