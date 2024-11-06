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
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const method_crypto_1 = require("../helpers/methods/method.crypto");
const JwtDataExtractor = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const authorizer = req.headers["authorization"];
    let tokenData = {};
    if (typeof authorizer === "undefined")
        return tokenData;
    const bearer = authorizer.split(" ", 2);
    if (bearer.length !== 2)
        return tokenData;
    if (!bearer[1])
        return tokenData;
    try {
        const decryptedToken = yield (0, method_crypto_1.decrypt)(bearer[1]);
        if (!decryptedToken)
            return tokenData;
        const verifyToken = (0, jsonwebtoken_1.verify)(decryptedToken, process.env.ECOM_JWT_SECRET);
        tokenData = verifyToken;
        return tokenData;
    }
    catch (error) {
        return tokenData;
    }
});
exports.default = JwtDataExtractor;
