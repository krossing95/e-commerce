"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_vendor_1 = __importDefault(require("../middlewares/middleware.vendor"));
const products_create_1 = __importDefault(require("../controllers/products/products/products.create"));
const productRouter = express_1.default.Router();
productRouter.post("/create", middleware_vendor_1.default, products_create_1.default);
exports.default = productRouter;
