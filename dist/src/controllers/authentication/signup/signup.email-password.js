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
const validator_signup_email_1 = __importDefault(require("../../../validators/authentication/validator.signup-email"));
const method_string_1 = require("../../../helpers/methods/method.string");
const model_user_1 = __importDefault(require("../../../models/model.user"));
const model_verification_1 = __importDefault(require("../../../models/model.verification"));
const method_date_1 = require("../../../helpers/methods/method.date");
const mail_signup_1 = __importDefault(require("../../../helpers/mail/authentication/mail.signup"));
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const uuid_1 = require("uuid");
const CreateUserUsingEmailPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const SALT = (0, bcrypt_1.genSaltSync)(10);
    const expected_payload = [
        "firstname",
        "email",
        "password",
        "lastname",
        "username",
        "phone",
    ];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    const requestBody = req.body;
    const validate = (0, validator_signup_email_1.default)(requestBody, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            requestBody.email = requestBody.email.trim();
            requestBody.password = (0, bcrypt_1.hashSync)(requestBody.password, SALT);
            requestBody.phone = !requestBody.phone
                ? null
                : (0, method_string_1.cleanExcessWhiteSpaces)(requestBody.phone);
            requestBody.username = !requestBody.username
                ? null
                : (0, method_string_1.joinTextsWithNoSpaces)(requestBody.username);
            const getUserInstance = yield model_user_1.default.findOne({
                $or: [
                    { email: requestBody.email },
                    ...(requestBody.username ? [{ username: requestBody.username }] : []),
                    ...(requestBody.phone ? [{ phone: requestBody.phone }] : []),
                ],
            });
            if (getUserInstance)
                return res.status(409).json({
                    message: "Email or username or phone is already taken",
                    code: "409",
                    data: {},
                });
            // save the user
            const newUser = new model_user_1.default(Object.assign(Object.assign({}, requestBody), { isSocial: false }));
            const createdUser = yield newUser.save();
            // save verification details
            const code = (0, uuid_1.v4)();
            const encryptedCode = yield (0, method_crypto_1.encrypt)(code);
            if (!encryptedCode) {
                yield model_user_1.default.findByIdAndDelete(createdUser._id);
                return res.status(500).json({
                    message: "User registration has failed",
                    code: "500",
                    data: {},
                });
            }
            yield model_verification_1.default.deleteMany({ userId: createdUser._id });
            const verificationObject = new model_verification_1.default({
                userId: createdUser._id,
                code: encryptedCode,
                issuedAt: (0, method_date_1.currentTimestamp)(),
            });
            // save the verification and send verification link to the user through mail
            const [_, sendMail] = yield Promise.all([
                verificationObject.save(),
                (0, mail_signup_1.default)({
                    id: (_a = createdUser._id) === null || _a === void 0 ? void 0 : _a.toString(),
                    code,
                    firstname: requestBody.firstname,
                    email: requestBody.email,
                }),
            ]);
            if (!sendMail) {
                yield model_user_1.default.findByIdAndDelete(createdUser._id);
                yield model_verification_1.default.findOneAndDelete({ userId: createdUser._id });
                return res.status(500).json({
                    message: "User registration has failed",
                    code: "500",
                    data: {},
                });
            }
            const _b = createdUser === null || createdUser === void 0 ? void 0 : createdUser.toObject(), { password, photoId, mfaDisabledAt } = _b, sendableUser = __rest(_b, ["password", "photoId", "mfaDisabledAt"]);
            return res.status(201).json({
                message: "User created successfully",
                code: "201",
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
    }));
    if (validate !== undefined)
        return res
            .status(400)
            .json({ message: validate.error, code: "400", data: {} });
});
exports.default = CreateUserUsingEmailPassword;
