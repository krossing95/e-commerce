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
const template_password_reset_1 = __importDefault(require("../templates/template.password-reset"));
const transport_1 = __importDefault(require("../transport"));
const usePasswordRequestMailer = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = (0, transport_1.default)();
    const template = (0, template_password_reset_1.default)(user.firstname, user.link);
    try {
        const sendMessage = yield transporter.sendMail({
            from: `${static_index_1.SystemName} < ${process.env.ECOM_MAIL_ADDRESS}>`,
            to: `${user.firstname} < ${user.email}>`,
            subject: `[${static_index_1.SystemName}] Password Reset Link`,
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
exports.default = usePasswordRequestMailer;
