import express from "express"
import VendorMiddleware from "../middlewares/middleware.vendor"
import CreateProduct from "../controllers/products/products/products.create"

const productRouter = express.Router()

productRouter.post("/create", VendorMiddleware, CreateProduct)

export default productRouter
