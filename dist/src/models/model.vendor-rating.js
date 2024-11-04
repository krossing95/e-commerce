"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRatingSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.vendorRatingSchema = new mongoose_1.default.Schema({
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
        required: true,
    },
}, { timestamps: true });
const VendorRating = mongoose_1.default.models.VendorRating ||
    mongoose_1.default.model("VendorRating", exports.vendorRatingSchema);
exports.default = VendorRating;
