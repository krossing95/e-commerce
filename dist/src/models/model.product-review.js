"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productReviewSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.productReviewSchema = new mongoose_1.default.Schema({
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
    },
    review: {
        type: String,
    },
    isEdited: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const ProductReview = mongoose_1.default.models.ProductReview ||
    mongoose_1.default.model("ProductReview", exports.productReviewSchema);
exports.default = ProductReview;
