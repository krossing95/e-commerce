import express from "express"
import VendorMiddleware from "../middlewares/middleware.vendor"
import CreateProduct from "../controllers/products/products/products.create"
import UpdateProduct from "../controllers/products/products/products.update"
import FetchProductsByVendor from "../controllers/products/products/products.fetch-by-vendor"
import { ConnectionMiddleware } from "../middlewares/middleware.connection"

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
  FetchProductsByVendor
)

export default productRouter
