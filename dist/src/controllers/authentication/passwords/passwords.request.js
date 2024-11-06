"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_request_1 = require("../../../helpers/request/helper.request");
const static_index_1 = require("../../../lib/static/static.index");
const model_user_1 = __importDefault(require("../../../models/model.user"));
const method_date_1 = require("../../../helpers/methods/method.date");
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const model_password_request_1 = __importDefault(require("../../../models/model.password-request"));
const mail_password_reset_1 = __importDefault(require("../../../helpers/mail/authentication/mail.password-reset"));
const RequestPasswordResetLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const expected_payload = ["email"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    const requestBody = req.body;
    try {
        if (!static_index_1.Regex.EMAIL.test(requestBody.email))
            return res
                .status(400)
                .json({ message: "Incorrect email address", code: "400", data: {} });
        // retrieve user by email address
        const user = (_a = (yield model_user_1.default.findOne({
            email: requestBody.email,
            isDeleted: false,
            isSocial: false,
        }))) === null || _a === void 0 ? void 0 : _a.toObject();
        if (!user)
            return res.status(404).json({
                message: "User not found",
                code: "404",
                data: {},
            });
        const code = JSON.stringify({
            userId: user._id.toString(),
            issuedAt: (0, method_date_1.currentTimestamp)(),
        });
        const encryptedCode = yield (0, method_crypto_1.encrypt)(code);
        if (!encryptedCode)
            return res
                .status(500)
                .json({ message: "Process has failed", code: "500", data: {} });
        yield model_password_request_1.default.deleteMany({ userId: user._id });
        // create password reset link reset
        const newPasswordRequest = new model_password_request_1.default({
            userId: user._id,
            code: encryptedCode,
        });
        yield newPasswordRequest.save();
        const link = `${process.env.ECOM_CLIENT_URL}auth/password-reset/reset?entity=${encryptedCode}`;
        yield (0, mail_password_reset_1.default)({
            firstname: user.firstname,
            email: user.email,
            link,
        });
        const { password, photoId, mfaDisabledAt } = user, sendableUser = __rest(user, ["password", "photoId", "mfaDisabledAt"]);
        return res.status(200).json({
            message: "Password reset link is sent to you",
            code: "200",
            data: { user: sendableUser },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Whoops! Something went wrong", code: "500", data: {} });
    }
});
exports.default = RequestPasswordResetLink;
