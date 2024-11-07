import express from "express"
import SuperAdminMiddleware from "../middlewares/middleware.superadmin"
import CreateProductCategory from "../controllers/products/categories/categories.create"
import FetchProductCategories from "../controllers/products/categories/categories.fetch"
import { ConnectionMiddleware } from "../middlewares/middleware.connection"
import UpdateProductCategory from "../controllers/products/categories/categories.update"
import DeleteProductCategory from "../controllers/products/categories/categories.delete"

const productCategoryRouter = express.Router()

productCategoryRouter.post(
  "/create",
  SuperAdminMiddleware,
  CreateProductCategory
)
productCategoryRouter.get("/", ConnectionMiddleware, FetchProductCategories)

productCategoryRouter.patch(
  "/update",
  SuperAdminMiddleware,
  UpdateProductCategory
)

productCategoryRouter.delete("/", SuperAdminMiddleware, DeleteProductCategory)

export default productCategoryRouter
