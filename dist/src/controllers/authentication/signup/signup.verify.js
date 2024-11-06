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
const model_verification_1 = __importDefault(require("../../../models/model.verification"));
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const method_date_1 = require("../../../helpers/methods/method.date");
const UserVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const expected_payload = ["code", "user_id"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    const requestBody = req.body;
    requestBody.code = requestBody.code.trim();
    if (!static_index_1.Regex.MONGOOBJECT.test(requestBody.user_id))
        return res
            .status(400)
            .json({ message: "Incorrect data", code: "400", data: {} });
    try {
        const [userData, verificationData] = yield Promise.all([
            model_user_1.default.findById({
                _id: requestBody.user_id,
            }).select({ isVerified: 1 }),
            model_verification_1.default.findOne({
                userId: requestBody.user_id,
            }),
        ]);
        if (!userData)
            return res.status(404).json({
                message: "User not found",
                code: "404",
                data: {},
            });
        if (!verificationData)
            return res
                .status(400)
                .json({ message: "Invalid verification link", code: "400", data: {} });
        if (userData.isVerified)
            return res.status(409).json({
                message: "User has been verified already",
                code: "409",
                data: {},
            });
        const decryptedDBCode = yield (0, method_crypto_1.decrypt)(verificationData.code);
        if (!decryptedDBCode)
            return res
                .status(500)
                .json({ message: "Verification has failed", code: "500", data: {} });
        if (decryptedDBCode !== requestBody.code)
            return res
                .status(400)
                .json({ message: "Invalid verification link", code: "400", data: {} });
        const timestamp = (0, method_date_1.currentTimestamp)();
        if (timestamp - verificationData.issuedAt > 86400000)
            return res.status(403).json({
                message: "Verification link has expired",
                code: "403",
                data: {},
            });
        const payload = {
            isVerified: true,
        };
        const verify = (_a = (yield model_user_1.default.findByIdAndUpdate(requestBody.user_id, Object.assign({}, payload), { new: true }))) === null || _a === void 0 ? void 0 : _a.toObject();
        if (!verify)
            return res.status(500).json({
                message: "User verification has failed",
                code: "500",
                data: {},
            });
        yield model_verification_1.default.deleteMany({ userId: requestBody.user_id });
        const { password, photoId, mfaDisabledAt } = verify, sendableUser = __rest(verify, ["password", "photoId", "mfaDisabledAt"]);
        return res.status(200).json({
            message: "User verified successfully",
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
exports.default = UserVerification;
