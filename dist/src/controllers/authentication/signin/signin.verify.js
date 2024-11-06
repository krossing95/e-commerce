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
const model_otp_1 = __importDefault(require("../../../models/model.otp"));
const model_user_1 = __importDefault(require("../../../models/model.user"));
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const method_date_1 = require("../../../helpers/methods/method.date");
const jsonwebtoken_1 = require("jsonwebtoken");
const static_index_1 = require("../../../lib/static/static.index");
const OtpVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = ["user_id", "otp", "disable_mfa"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve request body
    const requestBody = req.body;
    try {
        if (!static_index_1.Regex.MONGOOBJECT.test(requestBody.user_id))
            return res
                .status(400)
                .json({ message: "No user found", code: "400", data: {} });
        // retrieve the opt and the user data
        const [otpData, userData] = yield Promise.all([
            model_otp_1.default.findOne({
                userId: requestBody.user_id,
            }),
            model_user_1.default.findById(requestBody.user_id),
        ]);
        if (!otpData || !userData)
            return res
                .status(400)
                .json({ message: "Incorrect OTP", code: "400", data: {} });
        const decryptedOtp = yield (0, method_crypto_1.decrypt)(otpData.otp);
        if (!decryptedOtp)
            return res
                .status(500)
                .json({ message: "Otp verification has failed", code: "500", data: {} });
        if (decryptedOtp !== requestBody.otp)
            return res
                .status(400)
                .json({ message: "Incorrect OTP", code: "400", data: {} });
        const timestamp = (0, method_date_1.currentTimestamp)();
        if (timestamp - otpData.issuedAt > 1200000)
            return res.status(403).json({
                message: "OTP has expired",
                code: "403",
                data: {},
            });
        //   generate the login token
        const _a = userData === null || userData === void 0 ? void 0 : userData.toObject(), { password, photoId, mfaDisabledAt } = _a, loggableUser = __rest(_a, ["password", "photoId", "mfaDisabledAt"]);
        const token = (0, jsonwebtoken_1.sign)(Object.assign({}, loggableUser), process.env.ECOM_JWT_SECRET, { expiresIn: process.env.ECOM_LOGIN_LONGEVITY });
        if (!token)
            return res.status(500).json({
                message: "Whoops! Something went wrong",
                code: "500",
                data: {},
            });
        const encryptedToken = yield (0, method_crypto_1.encrypt)(token);
        if (!encryptedToken)
            return res
                .status(500)
                .json({ message: "Login has failed", code: "500", data: {} });
        if (requestBody.disable_mfa) {
            const payload = {
                mfaActivated: true,
                mfaDisabledAt: timestamp,
            };
            yield model_user_1.default.findByIdAndUpdate(requestBody.user_id, Object.assign({}, payload), { new: true });
        }
        yield model_otp_1.default.deleteMany({ userId: requestBody.user_id });
        return res.status(200).json({
            message: "Signed in successfully",
            code: "200",
            data: {
                user: loggableUser,
                resend_otp_token: null,
                token: encryptedToken,
                willVerifyMFACode: false,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Whoops! Something went wrong", code: "500", data: {} });
    }
});
exports.default = OtpVerification;
