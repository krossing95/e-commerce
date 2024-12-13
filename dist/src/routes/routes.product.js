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
const products_fetch_across_vendors_1 = __importDefault(require("../controllers/products/products/products.fetch-across-vendors"));
const products_fetch_one_1 = __importDefault(require("../controllers/products/products/products.fetch-one"));
const products_delete_1 = __importDefault(require("../controllers/products/products/products.delete"));
const products_delete_photos_1 = __importDefault(require("../controllers/products/products/products.delete-photos"));
const middleware_all_users_1 = __importDefault(require("../middlewares/middleware.all-users"));
const reviews_create_1 = __importDefault(require("../controllers/products/products/reviews/reviews.create"));
const wishlists_create_1 = __importDefault(require("../controllers/products/products/wishlists/wishlists.create"));
const wishlists_fetch_1 = __importDefault(require("../controllers/products/products/wishlists/wishlists.fetch"));
const productRouter = express_1.default.Router();
productRouter.post("/create", middleware_vendor_1.default, products_create_1.default);
productRouter.patch("/update", middleware_vendor_1.default, products_update_1.default);
productRouter.get("/products-by-vendor", middleware_vendor_1.default, products_fetch_by_vendor_1.default);
productRouter.get("/products-across-vendors", middleware_connection_1.ConnectionMiddleware, products_fetch_across_vendors_1.default);
productRouter.get("/products-detail", middleware_connection_1.ConnectionMiddleware, products_fetch_one_1.default);
productRouter.delete("/delete", middleware_vendor_1.default, products_delete_1.default);
productRouter.patch("/photos-removal", middleware_vendor_1.default, products_delete_photos_1.default);
productRouter.post("/rate-or-review", middleware_all_users_1.default, reviews_create_1.default);
productRouter.post("/wishlist/create", middleware_all_users_1.default, wishlists_create_1.default);
productRouter.get("/wishlist", middleware_all_users_1.default, wishlists_fetch_1.default);
exports.default = productRouter;
