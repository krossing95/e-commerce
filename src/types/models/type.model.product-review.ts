import { UserModel } from "./type.model.user"

export type ProductReviewModel = {
  _id: string
  productId: string
  customerId: string
  rate: number | null
  review: string | null
  isEdited: boolean
  isDeleted: boolean
}

export type PopulatedProductReviewModel = Omit<
  ProductReviewModel,
  "customerId"
> & {
  customerId: UserModel
}
