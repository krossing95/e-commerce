"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_superadmin_1 = __importDefault(require("../middlewares/middleware.superadmin"));
const categories_create_1 = __importDefault(require("../controllers/products/categories/categories.create"));
const categories_fetch_1 = __importDefault(require("../controllers/products/categories/categories.fetch"));
const middleware_connection_1 = require("../middlewares/middleware.connection");
const productCategoryRouter = express_1.default.Router();
productCategoryRouter.post("/create", middleware_superadmin_1.default, categories_create_1.default);
productCategoryRouter.get("/", middleware_connection_1.ConnectionMiddleware, categories_fetch_1.default);
exports.default = productCategoryRouter;
