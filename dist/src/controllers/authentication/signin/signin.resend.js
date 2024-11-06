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
const middleware_jwt_data_1 = __importDefault(require("../../../middlewares/middleware.jwt-data"));
const method_date_1 = require("../../../helpers/methods/method.date");
const model_user_1 = __importDefault(require("../../../models/model.user"));
const model_otp_1 = __importDefault(require("../../../models/model.otp"));
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const mail_signin_1 = __importDefault(require("../../../helpers/mail/authentication/mail.signin"));
const ResendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = ["resend_otp_token"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    const requestBody = req.body;
    if (requestBody.resend_otp_token.length === 0)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    try {
        req.headers["authorization"] = `Bearer ${requestBody.resend_otp_token}`;
        const tokenData = yield (0, middleware_jwt_data_1.default)(req);
        if (!Object.keys(tokenData).includes("tk_exp"))
            return res.status(403).json({
                message: "Not eligible to request for OTP",
                code: "403",
                data: {},
            });
        const tokenDataObj = tokenData;
        const tk_exp = tokenDataObj.tk_exp;
        const timestamp = (0, method_date_1.currentTimestamp)();
        if (timestamp > tk_exp)
            return res.status(403).json({
                message: "Forbidden: Try to login again",
                code: "403",
                data: {},
            });
        // retrieve the user
        const user = yield model_user_1.default.findById(tokenDataObj._id);
        if (!user)
            return res
                .status(404)
                .json({ message: "User not found", code: "404", data: {} });
        if (tokenDataObj._id !== user._id.toString())
            return res.status(403).json({
                message: "Not eligible to request for OTP",
                code: "403",
                data: {},
            });
        // discard the otps registered on the user
        yield model_otp_1.default.deleteMany({ userId: tokenDataObj._id });
        let otp = "";
        while (otp.length !== 6) {
            otp = Math.floor(Math.random() * 999999 + 1).toString();
        }
        const encryptedOtp = yield (0, method_crypto_1.encrypt)(otp);
        if (!encryptedOtp)
            return res
                .status(500)
                .json({ message: "Process has failed", code: "500", data: {} });
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
        const _a = user === null || user === void 0 ? void 0 : user.toObject(), { password, photoId, mfaDisabledAt } = _a, loggableUser = __rest(_a, ["password", "photoId", "mfaDisabledAt"]);
        return res.status(200).json({
            message: "OTP resent successfully",
            code: "200",
            data: {
                user: loggableUser,
                resend_otp_token: requestBody.resend_otp_token,
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
exports.default = ResendOtp;
