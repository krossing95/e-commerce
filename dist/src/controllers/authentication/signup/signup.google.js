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
const static_index_1 = require("../../../lib/static/static.index");
const uuid_1 = require("uuid");
const model_verification_1 = __importDefault(require("../../../models/model.verification"));
const method_date_1 = require("../../../helpers/methods/method.date");
const method_crypto_1 = require("../../../helpers/methods/method.crypto");
const mail_signup_1 = __importDefault(require("../../../helpers/mail/authentication/mail.signup"));
const CreateUserUsingGoogle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const expected_payload = ["name", "email"];
    // check for true request body structure
    const truePayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!truePayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // fetch the request body
    const requestBody = req.body;
    // trim email address
    requestBody.email = requestBody.email.trim();
    // validate the email address
    if (!static_index_1.Regex.EMAIL.test(requestBody.email))
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    try {
        const getEmailInstance = yield model_user_1.default.findOne({
            email: requestBody.email,
        });
        if (getEmailInstance)
            return res.status(409).json({
                message: "Email address is already taken",
                code: "409",
                data: {},
            });
        // save the user
        const newUser = new model_user_1.default({
            firstname: requestBody.name,
            email: requestBody.email,
            isSocial: true,
        });
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
                firstname: requestBody.name,
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
});
exports.default = CreateUserUsingGoogle;
