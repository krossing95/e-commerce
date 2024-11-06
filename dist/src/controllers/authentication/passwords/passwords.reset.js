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
const bcrypt_1 = require("bcrypt");
const helper_request_1 = require("../../../helpers/request/helper.request");
const static_index_1 = require("../../../lib/static/static.index");
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const method_date_1 = require("../../../helpers/methods/method.date");
const model_password_request_1 = __importDefault(require("../../../models/model.password-request"));
const model_user_1 = __importDefault(require("../../../models/model.user"));
const ResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const SALT = (0, bcrypt_1.genSaltSync)(10);
    const expected_payload = ["newPassword", "entity"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    const requestBody = req.body;
    try {
        if (!static_index_1.Regex.PASSWORD.test(requestBody.newPassword) ||
            requestBody.newPassword.length < 6)
            return res.status(400).json({
                message: "Password must be at least 6 characters & contain a combination of uppercase, lowercase alphanumeric and special characters",
                code: "400",
                data: {},
            });
        const decryptedEntity = yield (0, method_crypto_1.decrypt)(requestBody.entity);
        if (!decryptedEntity)
            return res
                .status(500)
                .json({ message: "Password reset has failed", code: "500", data: {} });
        const entityObject = JSON.parse(decryptedEntity);
        const timestamp = (0, method_date_1.currentTimestamp)();
        if (timestamp - entityObject.issuedAt > 3600000)
            return res
                .status(403)
                .json({ message: "The link has expired", code: "403", data: {} });
        // get password reset props
        const passwordResetData = yield model_password_request_1.default.findOne({
            userId: entityObject.userId,
        });
        if (!passwordResetData)
            return res
                .status(404)
                .json({ message: "Data not found", code: "404", data: {} });
        const decryptedDBEntity = yield (0, method_crypto_1.decrypt)(passwordResetData.code);
        if (!decryptedDBEntity)
            return res
                .status(500)
                .json({ message: "Password reset has failed", code: "500", data: {} });
        const dbentityObject = JSON.parse(decryptedDBEntity);
        if (timestamp - dbentityObject.issuedAt > 3600000)
            return res
                .status(403)
                .json({ message: "The link has expired", code: "403", data: {} });
        const hashedPassword = (0, bcrypt_1.hashSync)(requestBody.newPassword, SALT);
        const payload = {
            password: hashedPassword,
        };
        const user = (_a = (yield model_user_1.default.findByIdAndUpdate(entityObject.userId, Object.assign({}, payload), { new: true }))) === null || _a === void 0 ? void 0 : _a.toObject();
        const { password, photoId, mfaDisabledAt } = user, sendableUser = __rest(user, ["password", "photoId", "mfaDisabledAt"]);
        yield model_password_request_1.default.deleteMany({ userId: entityObject.userId });
        return res.status(200).json({
            message: "Password reset was successful",
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
exports.default = ResetPassword;
