"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subcategorySchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.subcategorySchema = new mongoose_1.default.Schema({
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
    },
    subcategory: {
        type: String,
        required: true,
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
const ProductSubcategory = mongoose_1.default.models.ProductSubcategory ||
    mongoose_1.default.model("ProductSubcategory", exports.subcategorySchema);
exports.default = ProductSubcategory;
