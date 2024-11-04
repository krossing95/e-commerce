"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorReviewSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.vendorReviewSchema = new mongoose_1.default.Schema({
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
const VendorReview = mongoose_1.default.models.VendorReview ||
    mongoose_1.default.model("VendorReview", exports.vendorReviewSchema);
exports.default = VendorReview;
