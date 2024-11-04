"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRatingSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.productRatingSchema = new mongoose_1.default.Schema({
    productId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    customerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rate: {
        type: Number,
        required: true,
    },
}, { timestamps: true });
const ProductRating = mongoose_1.default.models.ProductRating ||
    mongoose_1.default.model("ProductRating", exports.productRatingSchema);
exports.default = ProductRating;
