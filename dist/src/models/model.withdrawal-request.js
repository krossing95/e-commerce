"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalRequestSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_index_1 = require("../lib/enum/enum.index");
exports.withdrawalRequestSchema = new mongoose_1.default.Schema({
    vendorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sales: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Sale",
        required: true,
    },
    withdrawalRequestCode: {
        type: String,
    },
    withdrawalRequestStatus: {
        type: String,
        enum: enum_index_1.WithdrawalRequestStatusEnum,
        default: enum_index_1.WithdrawalRequestStatusEnum.PENDING,
    },
    creditedAt: {
        type: Date,
    },
}, { timestamps: true });
const WithdrawalRequest = mongoose_1.default.models.WithdrawalRequest ||
    mongoose_1.default.model("WithdrawalRequest", exports.withdrawalRequestSchema);
exports.default = WithdrawalRequest;
