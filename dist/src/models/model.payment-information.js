"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentInformationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_index_1 = require("../lib/enum/enum.index");
exports.paymentInformationSchema = new mongoose_1.default.Schema({
    vendorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentAccountType: {
        type: String,
        enum: enum_index_1.PaymentInformationType,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    paymentAccountName: {
        type: String,
        required: true,
    },
    paymentAccountNumber: {
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
const PaymentInformation = mongoose_1.default.models.PaymentInformation ||
    mongoose_1.default.model("PaymentInformation", exports.paymentInformationSchema);
exports.default = PaymentInformation;
