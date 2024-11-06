"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.otpSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
        ref: "User",
    },
    otp: {
        type: String,
        required: true,
    },
    issuedAt: {
        type: Number,
        required: true,
    },
});
const Otp = mongoose_1.default.models.Otp || mongoose_1.default.model("Otp", exports.otpSchema);
exports.default = Otp;
