import mongoose from "mongoose"
import { cartSchema } from "../../models/model.cart"
import { paymentInformationSchema } from "../../models/model.payment-information"
import { productCategorySchema } from "../../models/model.product-category"
import { productReviewSchema } from "../../models/model.product-review"
import { productSchema } from "../../models/model.product"
import { saleSchema } from "../../models/model.sale"
import { userSchema } from "../../models/model.user"
import { vendorReviewSchema } from "../../models/model.vendor-review"
import { wishlistSchema } from "../../models/model.wishlist"
import { withdrawalRequestSchema } from "../../models/model.withdrawal-request"
import { subcategorySchema } from "../../models/model.subcategory"

let isConnected = false // Variable to track the connection status

export const connection = async () => {
  // Set strict query mode for Mongoose to prevent unknown field queries.
  mongoose.set("strictQuery", true)

  const mongodbUrl = process.env.ECOM_MONGOURL

  if (!mongodbUrl) return

  // load all models

  mongoose.models.Cart || mongoose.model("Cart", cartSchema)
  mongoose.models.PaymentInformation ||
    mongoose.model("PaymentInformation", paymentInformationSchema)
  mongoose.models.ProductCategory ||
    mongoose.model("ProductCategory", productCategorySchema)
  mongoose.models.ProductSubcategory ||
    mongoose.model("ProductSubcategory", subcategorySchema)
  mongoose.models.ProductReview ||
    mongoose.model("ProductReview", productReviewSchema)
  mongoose.models.Product || mongoose.model("Product", productSchema)
  mongoose.models.Sale || mongoose.model("Sale", saleSchema)
  mongoose.models.User || mongoose.model("User", userSchema)
  mongoose.models.VendorReview ||
    mongoose.model("VendorReview", vendorReviewSchema)
  mongoose.models.WishList || mongoose.model("WishList", wishlistSchema)

  mongoose.models.WithdrawalRequest ||
    mongoose.model("WithdrawalRequest", withdrawalRequestSchema)

  // If the connection is already established, return without creating a new connection.
  if (isConnected) return

  try {
    await mongoose.connect(mongodbUrl, {
      minPoolSize: 10,
      connectTimeoutMS: 20000,
    })
    isConnected = true // Set the connection status to true
  } catch (error) {
    throw new Error("connection failed")
  }
}
