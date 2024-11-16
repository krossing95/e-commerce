import express from "express"
import VendorMiddleware from "../middlewares/middleware.vendor"
import CreateProduct from "../controllers/products/products/products.create"
import UpdateProduct from "../controllers/products/products/products.update"
import FetchProductsByVendor from "../controllers/products/products/products.fetch-by-vendor"
import { ConnectionMiddleware } from "../middlewares/middleware.connection"
import FetchProductsAcrossVendors from "../controllers/products/products/products.fetch-across-vendors"
import FetchASingleProduct from "../controllers/products/products/products.fetch-one"
import DeleteProduct from "../controllers/products/products/products.delete"
import DeleteProductPhotos from "../controllers/products/products/products.delete-photos"
import InterUserMiddleware from "../middlewares/middleware.all-users"
import CreateProductReview from "../controllers/products/products/reviews/reviews.create"
import CreateWishlist from "../controllers/products/products/wishlists/wishlists.create"
import FetchProductsInWishlist from "../controllers/products/products/wishlists/wishlists.fetch"

const productRouter = express.Router()

productRouter.post("/create", VendorMiddleware, CreateProduct)
productRouter.patch("/update", VendorMiddleware, UpdateProduct)
productRouter.get(
  "/products-by-vendor",
  VendorMiddleware,
  FetchProductsByVendor
)
productRouter.get(
  "/products-across-vendors",
  ConnectionMiddleware,
  FetchProductsAcrossVendors
)
productRouter.get("/products-detail", ConnectionMiddleware, FetchASingleProduct)
productRouter.delete("/delete", VendorMiddleware, DeleteProduct)
productRouter.patch("/photos-removal", VendorMiddleware, DeleteProductPhotos)

productRouter.post("/rate-or-review", InterUserMiddleware, CreateProductReview)

productRouter.post("/wishlist/create", InterUserMiddleware, CreateWishlist)
productRouter.get("/wishlist", InterUserMiddleware, FetchProductsInWishlist)

export default productRouter
