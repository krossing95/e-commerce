"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Regex = exports.SystemName = void 0;
exports.SystemName = "Ecommerce";
exports.Regex = {
    PASSWORD: /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*['"{}|:;<>,?!@#$%^&*()\-__+.]){1,}).{8,}$/,
    EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    NUMERICAL: /^[0-9]+$/,
    ALPHA: /^[ A-Za-z'-]*$/,
    ALPHANUMERIC: /^([a-zA-Z0-9 _-]+)$/,
    MONGOOBJECT: /^[0-9a-fA-F]{24}$/,
    SPECIALCHARS: /\W|_/g,
    CSVDOT_HYPHEN: /^[a-zA-Z0-9 .,-:;()&?!']{0,50000000}$/,
    USERNAME: /^[a-zA-Z0-9]+(?:[_-][a-zA-Z0-9]+)?$/,
    ISBASE64: /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/,
    ISACADEMICYEAR: /^\d{4}-\d{4}$/,
    UNEXPECTED_ATTR: /[^\w\s]/gi,
    WHITESPACES: /\s{2,}/g,
    DECIMAL_NUM: /^\d+(\.\d{1,3})?$/,
    URL: /^(https?|ftp):\/\/(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost)(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i,
};
