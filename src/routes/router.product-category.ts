import express from "express"
import SuperAdminMiddleware from "../middlewares/middleware.superadmin"
import CreateProductCategory from "../controllers/products/categories/categories.create"
import FetchProductCategories from "../controllers/products/categories/categories.fetch"
import { ConnectionMiddleware } from "../middlewares/middleware.connection"

const productCategoryRouter = express.Router()

productCategoryRouter.post(
  "/create",
  SuperAdminMiddleware,
  CreateProductCategory
)
productCategoryRouter.get("/", ConnectionMiddleware, FetchProductCategories)

export default productCategoryRouter
