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
const model_user_1 = __importDefault(require("../../../models/model.user"));
const uuid_1 = require("uuid");
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const model_verification_1 = __importDefault(require("../../../models/model.verification"));
const method_date_1 = require("../../../helpers/methods/method.date");
const mail_signup_1 = __importDefault(require("../../../helpers/mail/authentication/mail.signup"));
const ResendUserVerificationLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const expected_payload = ["user_id"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    const requestBody = req.body;
    try {
        // get user account
        const user = yield model_user_1.default.findById(requestBody.user_id);
        if (!user)
            return res.status(404).json({
                message: "User not found",
                code: "404",
                data: {},
            });
        if (user.isVerified)
            return res.status(409).json({
                message: "User has been verified already",
                code: "409",
                data: {},
            });
        //   generate the verification link
        const code = (0, uuid_1.v4)();
        const encryptedCode = yield (0, method_crypto_1.encrypt)(code);
        if (!encryptedCode) {
            yield model_user_1.default.findByIdAndDelete(requestBody.user_id);
            return res.status(500).json({
                message: "Process has failed",
                code: "500",
                data: {},
            });
        }
        yield model_verification_1.default.deleteMany({ userId: requestBody.user_id });
        const verificationObject = new model_verification_1.default({
            userId: user._id,
            code: encryptedCode,
            issuedAt: (0, method_date_1.currentTimestamp)(),
        });
        // save the verification and send verification link to the user through mail
        const [_, sendMail] = yield Promise.all([
            verificationObject.save(),
            (0, mail_signup_1.default)({
                id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString(),
                code,
                firstname: user.firstname,
                email: user.email,
            }),
        ]);
        if (!sendMail) {
            return res.status(500).json({
                message: "Process has failed",
                code: "500",
                data: {},
            });
        }
        const _b = user === null || user === void 0 ? void 0 : user.toObject(), { password, photoId, mfaDisabledAt } = _b, sendableUser = __rest(_b, ["password", "photoId", "mfaDisabledAt"]);
        return res.status(200).json({
            message: "Link resent successfully",
            code: "200",
            data: { user: sendableUser },
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
exports.default = ResendUserVerificationLink;
