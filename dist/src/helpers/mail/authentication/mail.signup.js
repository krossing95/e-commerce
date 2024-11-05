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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const static_index_1 = require("../../../lib/static/static.index");
const template_sign_up_1 = __importDefault(require("../templates/template.sign-up"));
const transport_1 = __importDefault(require("../transport"));
const useSignUpMailer = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = (0, transport_1.default)();
    const name = !user.firstname ? "Valued Customer" : user.firstname.trim();
    const link = `${process.env.ECOM_CLIENT_URL}auth/register/verify?user_id=${user.id}&code=${user.code}`;
    const template = (0, template_sign_up_1.default)(name, link);
    try {
        const sendMessage = yield transporter.sendMail({
            from: `${static_index_1.SystemName} < ${process.env.ECOM_MAIL_ADDRESS}>`,
            to: `${name} < ${user.email}>`,
            subject: `[${static_index_1.SystemName}] User Verification`,
            html: template,
        });
        if (sendMessage.accepted.includes(user.email))
            return true;
        return false;
    }
    catch (error) {
        return false;
    }
});
exports.default = useSignUpMailer;
