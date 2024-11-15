import { UserModel } from "./type.model.user"

export type ProductReviewModel = {
  _id: string
  productId: string
  customerId: string
  rate: number
  review: string
  isEdited: boolean
  isDeleted: boolean
}

export type PopulatedProductReviewModel = Omit<
  ProductReviewModel,
  "customerId"
> & {
  customerId: UserModel
}
