"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const MailTransporter = () => {
    const transporter = nodemailer_1.default.createTransport({
        service: process.env.ECOM_MAIL_SERVICE,
        host: process.env.ECOM_MAIL_SERVER,
        port: Number(process.env.ECOM_MAIL_PORT),
        secure: true,
        auth: {
            user: process.env.ECOM_MAIL_ADDRESS,
            pass: process.env.ECOM_GMAIL_APP_PASSWORD,
        },
    });
    return transporter;
};
exports.default = MailTransporter;
