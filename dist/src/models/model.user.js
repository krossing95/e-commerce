"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_index_1 = require("../lib/enum/enum.index");
exports.userSchema = new mongoose_1.default.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    usertype: {
        type: String,
        enum: enum_index_1.UsertypeEnum,
        default: enum_index_1.UsertypeEnum.CUSTOMER,
    },
    gender: {
        type: String,
        enum: enum_index_1.GenderEnum,
        default: enum_index_1.GenderEnum.UNKNOWN,
    },
    address: {
        type: String,
    },
    password: {
        type: String,
    },
    photoUrl: String,
    photoId: String,
    isVerified: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isSocial: {
        type: Boolean,
        default: false,
    },
    mfaActivated: {
        type: Boolean,
        default: false,
    },
    mfaDisabledAt: {
        type: Number,
    },
}, { timestamps: true });
const User = mongoose_1.default.models.User || mongoose_1.default.model("User", exports.userSchema);
exports.default = User;
