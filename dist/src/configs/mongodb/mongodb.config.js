"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const model_cart_1 = require("../../models/model.cart");
const model_payment_information_1 = require("../../models/model.payment-information");
const model_product_category_1 = require("../../models/model.product-category");
const model_product_review_1 = require("../../models/model.product-review");
const model_product_1 = require("../../models/model.product");
const model_sale_1 = require("../../models/model.sale");
const model_user_1 = require("../../models/model.user");
const model_vendor_review_1 = require("../../models/model.vendor-review");
const model_wishlist_1 = require("../../models/model.wishlist");
const model_withdrawal_request_1 = require("../../models/model.withdrawal-request");
const model_subcategory_1 = require("../../models/model.subcategory");
let isConnected = false; // Variable to track the connection status
const connection = () => __awaiter(void 0, void 0, void 0, function* () {
    // Set strict query mode for Mongoose to prevent unknown field queries.
    mongoose_1.default.set("strictQuery", true);
    const mongodbUrl = process.env.ECOM_MONGOURL;
    if (!mongodbUrl)
        return;
    // load all models
    mongoose_1.default.models.Cart || mongoose_1.default.model("Cart", model_cart_1.cartSchema);
    mongoose_1.default.models.PaymentInformation ||
        mongoose_1.default.model("PaymentInformation", model_payment_information_1.paymentInformationSchema);
    mongoose_1.default.models.ProductCategory ||
        mongoose_1.default.model("ProductCategory", model_product_category_1.productCategorySchema);
    mongoose_1.default.models.ProductSubcategory ||
        mongoose_1.default.model("ProductSubcategory", model_subcategory_1.subcategorySchema);
    mongoose_1.default.models.ProductReview ||
        mongoose_1.default.model("ProductReview", model_product_review_1.productReviewSchema);
    mongoose_1.default.models.Product || mongoose_1.default.model("Product", model_product_1.productSchema);
    mongoose_1.default.models.Sale || mongoose_1.default.model("Sale", model_sale_1.saleSchema);
    mongoose_1.default.models.User || mongoose_1.default.model("User", model_user_1.userSchema);
    mongoose_1.default.models.VendorReview ||
        mongoose_1.default.model("VendorReview", model_vendor_review_1.vendorReviewSchema);
    mongoose_1.default.models.WishList || mongoose_1.default.model("WishList", model_wishlist_1.wishlistSchema);
    mongoose_1.default.models.WithdrawalRequest ||
        mongoose_1.default.model("WithdrawalRequest", model_withdrawal_request_1.withdrawalRequestSchema);
    // If the connection is already established, return without creating a new connection.
    if (isConnected)
        return;
    try {
        yield mongoose_1.default.connect(mongodbUrl, {
            minPoolSize: 10,
            connectTimeoutMS: 20000,
        });
        isConnected = true; // Set the connection status to true
    }
    catch (error) {
        throw new Error("connection failed");
    }
});
exports.connection = connection;
