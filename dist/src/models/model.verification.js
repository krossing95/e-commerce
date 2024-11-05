"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.verificationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    code: {
        type: String,
        required: true,
    },
    issuedAt: {
        type: Number,
        required: true,
    },
});
const Verification = mongoose_1.default.models.Verification ||
    mongoose_1.default.model("Verification", exports.verificationSchema);
exports.default = Verification;
