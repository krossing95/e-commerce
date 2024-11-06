"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const passwordRequestSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
        ref: "User",
    },
    code: {
        type: String,
        required: true,
    },
});
const PasswordRequest = mongoose_1.default.models.PasswordRequest ||
    mongoose_1.default.model("PasswordRequest", passwordRequestSchema);
exports.default = PasswordRequest;
