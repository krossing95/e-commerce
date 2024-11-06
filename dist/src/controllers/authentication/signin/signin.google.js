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
exports.login = void 0;
const helper_request_1 = require("../../../helpers/request/helper.request");
const model_user_1 = __importDefault(require("../../../models/model.user"));
const method_check_mfa_disability_1 = require("../../../helpers/methods/method.check-mfa-disability");
const jsonwebtoken_1 = require("jsonwebtoken");
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const method_date_1 = require("../../../helpers/methods/method.date");
const bson_1 = require("bson");
const model_otp_1 = __importDefault(require("../../../models/model.otp"));
const mail_signin_1 = __importDefault(require("../../../helpers/mail/authentication/mail.signin"));
const login = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // create token
        const token = (0, jsonwebtoken_1.sign)(Object.assign({}, user), process.env.ECOM_JWT_SECRET, { expiresIn: process.env.ECOM_LOGIN_LONGEVITY });
        if (!token)
            return res.status(500).json({
                message: "Whoops! Something went wrong",
                code: "500",
                data: {},
            });
        const encryptedToken = yield (0, method_crypto_1.encrypt)(token); // encrypt token
        if (!encryptedToken)
            return res
                .status(500)
                .json({ message: "Login has failed", code: "500", data: {} });
        return res.status(200).json({
            message: "Signed in successfully",
            code: "200",
            data: {
                user,
                resend_otp_token: null,
                token: encryptedToken,
                willVerifyMFACode: false,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Whoops! Something went wrong",
            code: "500",
            data: {},
        });
    }
});
exports.login = login;
const LoginUsingGoogle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const expected_payload = ["email"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    const requestBody = req.body;
    try {
        const user = (_a = (yield model_user_1.default.findOne({
            email: requestBody.email,
            isDeleted: false,
            isSocial: true,
        }))) === null || _a === void 0 ? void 0 : _a.toObject();
        if (!user)
            return res
                .status(404)
                .json({ message: "Please sign up to continue", code: "404", data: {} });
        if (!user.isVerified)
            return res
                .status(403)
                .json({ message: "User is not verified", code: "403", data: {} });
        // check mfa eligibility
        const mfaData = (0, method_check_mfa_disability_1.checkMfaEligibility)(user.mfaActivated, user.mfaDisabledAt);
        const { password, photoId, mfaDisabledAt } = user, loggableUser = __rest(user, ["password", "photoId", "mfaDisabledAt"]);
        if (!mfaData.useMfa)
            return yield (0, exports.login)(Object.assign({}, loggableUser), res);
        const timestamp = (0, method_date_1.currentTimestamp)();
        // continue otp resend token generation
        let resendToken = (0, jsonwebtoken_1.sign)({
            tk_id: new bson_1.ObjectId().toString(),
            _id: (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString(),
            tk_exp: timestamp + 1200000,
        }, process.env.ECOM_JWT_SECRET, { expiresIn: "1h" });
        resendToken = !resendToken ? "" : resendToken;
        const encryptedResendToken = yield (0, method_crypto_1.encrypt)(resendToken);
        if (!encryptedResendToken)
            return res
                .status(500)
                .json({ message: "Login has failed", code: "500", data: {} });
        // process OTP and send to user
        yield model_otp_1.default.deleteMany({ userId: user._id });
        let otp = "";
        while (otp.length !== 6) {
            otp = Math.floor(Math.random() * 999999 + 1).toString();
        }
        const encryptedOtp = yield (0, method_crypto_1.encrypt)(otp);
        if (!encryptedOtp)
            return res
                .status(500)
                .json({ message: "Login has failed", code: "500", data: {} });
        // create new otp instance
        const newOtp = new model_otp_1.default({
            userId: user._id,
            otp: encryptedOtp,
            issuedAt: timestamp,
        });
        yield Promise.all([
            newOtp.save(),
            (0, mail_signin_1.default)({
                firstname: user.firstname,
                email: user.email,
                otp,
            }),
        ]);
        return res.status(200).json({
            message: "Credentials checked successfully",
            code: "200",
            data: {
                user: loggableUser,
                resend_otp_token: encryptedResendToken,
                token: null,
                willVerifyMFACode: true,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Whoops! Something went wrong", code: "500", data: {} });
    }
});
exports.default = LoginUsingGoogle;
