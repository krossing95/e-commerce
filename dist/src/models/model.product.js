"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.productSchema = new mongoose_1.default.Schema({
    vendorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
    },
    color: {
        type: String,
    },
    description: {
        type: String,
    },
    plainTextDescription: {
        type: String,
    },
    region: {
        type: String,
    },
    town: {
        type: String,
    },
    featuredImage: {
        type: String,
        required: true,
    },
    featuredImageId: {
        type: String,
        required: true,
    },
    productImages: {
        type: [
            {
                productImageUrl: { type: String, required: true },
                productImageId: { type: String, required: true },
            },
        ],
    },
    isNegotiable: {
        type: Boolean,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Product = mongoose_1.default.models.Product || mongoose_1.default.model("Product", exports.productSchema);
exports.default = Product;
