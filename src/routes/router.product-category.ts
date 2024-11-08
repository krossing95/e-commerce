import express from "express"
import SuperAdminMiddleware from "../middlewares/middleware.superadmin"
import CreateProductCategory from "../controllers/products/categories/categories.create"
import FetchProductCategories from "../controllers/products/categories/categories.fetch"
import { ConnectionMiddleware } from "../middlewares/middleware.connection"
import UpdateProductCategory from "../controllers/products/categories/categories.update"
import DeleteProductCategory from "../controllers/products/categories/categories.delete"
import CreateProductSubcategory from "../controllers/products/categories/subcategories/subcategories.create"
import FetchProductSubcategories from "../controllers/products/categories/subcategories/subcategories.fetch"

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

// subcategories

productCategoryRouter.post(
  "/subcategories/create",
  SuperAdminMiddleware,
  CreateProductSubcategory
)
productCategoryRouter.get(
  "/subcategories",
  ConnectionMiddleware,
  FetchProductSubcategories
)

export default productCategoryRouter
