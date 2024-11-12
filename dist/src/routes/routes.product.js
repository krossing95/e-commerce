"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_vendor_1 = __importDefault(require("../middlewares/middleware.vendor"));
const products_create_1 = __importDefault(require("../controllers/products/products/products.create"));
const products_update_1 = __importDefault(require("../controllers/products/products/products.update"));
const products_fetch_by_vendor_1 = __importDefault(require("../controllers/products/products/products.fetch-by-vendor"));
const middleware_connection_1 = require("../middlewares/middleware.connection");
const productRouter = express_1.default.Router();
productRouter.post("/create", middleware_vendor_1.default, products_create_1.default);
productRouter.patch("/update", middleware_vendor_1.default, products_update_1.default);
productRouter.get("/products-by-vendor", middleware_vendor_1.default, products_fetch_by_vendor_1.default);
productRouter.get("/products-across-vendors", middleware_connection_1.ConnectionMiddleware, products_fetch_by_vendor_1.default);
exports.default = productRouter;
