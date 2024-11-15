"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.saleSchema = new mongoose_1.default.Schema({
    vendorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Product",
    },
    totalCost: {
        type: Number,
        required: true,
    },
    isWithdrawn: {
        type: Boolean,
        default: false,
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
const Sale = mongoose_1.default.models.Sale || mongoose_1.default.model("Sale", exports.saleSchema);
exports.default = Sale;
