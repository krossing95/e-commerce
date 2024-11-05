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
exports.decrypt = exports.encrypt = void 0;
const libsodium_wrappers_1 = __importDefault(require("libsodium-wrappers"));
const encrypt = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const KEY = process.env.ECOM_SODIUM_KEY;
        const NONCE = process.env.ECOM_SODIUM_NONCE;
        if (!NONCE || !KEY)
            return null;
        yield libsodium_wrappers_1.default.ready;
        // Access key and nonce from environment variables
        const key = libsodium_wrappers_1.default.from_hex(KEY);
        const nonce = libsodium_wrappers_1.default.from_hex(NONCE);
        // Encrypt the data
        const cipherText = libsodium_wrappers_1.default.crypto_secretbox_easy(data, nonce, key);
        return libsodium_wrappers_1.default.to_hex(cipherText);
    }
    catch (error) {
        return null;
    }
});
exports.encrypt = encrypt;
const decrypt = (encryptedData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const KEY = process.env.ECOM_SODIUM_KEY;
        const NONCE = process.env.ECOM_SODIUM_NONCE;
        if (!NONCE || !KEY)
            return null;
        yield libsodium_wrappers_1.default.ready;
        // Access key and nonce from environment variables
        const key = libsodium_wrappers_1.default.from_hex(KEY);
        const nonce = libsodium_wrappers_1.default.from_hex(NONCE);
        // Decrypt the data
        const ciphertext = libsodium_wrappers_1.default.from_hex(encryptedData); // Convert from hex
        const decryptedData = libsodium_wrappers_1.default.crypto_secretbox_open_easy(ciphertext, nonce, key);
        return libsodium_wrappers_1.default.to_string(decryptedData);
    }
    catch (error) {
        return null;
    }
});
exports.decrypt = decrypt;
