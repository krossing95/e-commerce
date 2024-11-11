"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_index_1 = require("../lib/enum/enum.index");
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
    subcategoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ProductSubcategory",
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
    },
    quantitySold: {
        type: Number,
    },
    price: {
        type: Number,
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
    district: {
        type: String,
    },
    featuredImage: {
        type: String,
    },
    featuredImageId: {
        type: String,
    },
    productImages: {
        type: [
            {
                productImageUrl: { type: String, required: true },
                productImageId: { type: String, required: true },
            },
        ],
        default: [],
    },
    publishingStatus: {
        type: String,
        enum: enum_index_1.ProductPublishingStatusEnum,
        default: enum_index_1.ProductPublishingStatusEnum.DRAFTED,
    },
    isNegotiable: {
        type: Boolean,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    tags: {
        type: [String],
        default: [],
    },
}, { timestamps: true });
const Product = mongoose_1.default.models.Product || mongoose_1.default.model("Product", exports.productSchema);
exports.default = Product;
