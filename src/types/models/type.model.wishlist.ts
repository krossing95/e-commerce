import { PopulatedProductModel } from "./type.model.product"
import { UserModel } from "./type.model.user"

export type WishListModel = {
  _id: string
  customerId: string
  productId: string
  createdAt: string
  updatedAt: string
}

export type PopulatedWishListModel = Omit<
  WishListModel,
  "customerId" | "productId"
> & {
  customerId: UserModel
  productId: PopulatedProductModel
}
