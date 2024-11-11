"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlainTextFromHtml = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const generatePlainTextFromHtml = (html) => {
    const plainText = (0, sanitize_html_1.default)(html, {
        allowedTags: [],
        allowedAttributes: {},
    });
    return plainText;
};
exports.generatePlainTextFromHtml = generatePlainTextFromHtml;
