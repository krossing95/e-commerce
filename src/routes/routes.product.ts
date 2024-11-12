import express from "express"
import VendorMiddleware from "../middlewares/middleware.vendor"
import CreateProduct from "../controllers/products/products/products.create"
import UpdateProduct from "../controllers/products/products/product.update"

const productRouter = express.Router()

productRouter.post("/create", VendorMiddleware, CreateProduct)
productRouter.patch("/update", VendorMiddleware, UpdateProduct)

export default productRouter
