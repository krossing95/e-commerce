"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productCategorySchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.productCategorySchema = new mongoose_1.default.Schema({
    category: {
        type: String,
        required: true,
    },
    subcategories: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "ProductSubcategory",
        default: [],
    },
    categoryImage: {
        type: String,
    },
    categoryImageId: {
        type: String,
    },
    description: {
        type: String,
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
const ProductCategory = mongoose_1.default.models.ProductCategory ||
    mongoose_1.default.model("ProductCategory", exports.productCategorySchema);
exports.default = ProductCategory;
