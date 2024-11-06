"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinTextsWithNoSpaces = exports.polishLongTexts = exports.cleanExcessWhiteSpaces = exports.cleanSCW = exports.capitalize = exports.cleanText = void 0;
const static_index_1 = require("../../lib/static/static.index");
const cleanText = (string) => {
    if (typeof string === "undefined" || string === null)
        return "";
    return string.trim().replace("<script>", "").replace("</script>", "");
};
exports.cleanText = cleanText;
const capitalize = (string) => {
    if (typeof string === "undefined" || string === null)
        return "";
    const array = string.trim().toLowerCase().split(" ");
    const formattedString = array.map((str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`);
    return (0, exports.cleanText)(formattedString.join(" "));
};
exports.capitalize = capitalize;
const cleanSCW = (string) => {
    const format = (0, exports.capitalize)(string.replace(static_index_1.Regex.UNEXPECTED_ATTR, "").replace(static_index_1.Regex.WHITESPACES, " "));
    return format;
};
exports.cleanSCW = cleanSCW;
const cleanExcessWhiteSpaces = (string) => {
    const format = (0, exports.cleanText)(string.replace(static_index_1.Regex.WHITESPACES, " "));
    return format;
};
exports.cleanExcessWhiteSpaces = cleanExcessWhiteSpaces;
const polishLongTexts = (string) => {
    const format = string.replace(static_index_1.Regex.WHITESPACES, " ");
    return (0, exports.cleanText)(format);
};
exports.polishLongTexts = polishLongTexts;
const joinTextsWithNoSpaces = (string) => (0, exports.cleanText)(string).replace(static_index_1.Regex.WHITESPACES, "");
exports.joinTextsWithNoSpaces = joinTextsWithNoSpaces;
