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
const middleware_jwt_data_1 = __importDefault(require("./middleware.jwt-data"));
const enum_index_1 = require("../lib/enum/enum.index");
const mongodb_config_1 = require("../configs/mongodb/mongodb.config");
const InterUserMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = yield (0, middleware_jwt_data_1.default)(req);
        const tokenDataObjectKeys = Object.keys(tokenData);
        if (!tokenDataObjectKeys.includes("_id"))
            return res
                .status(401)
                .json({ message: "Authentication is required", code: "401", data: {} });
        const userData = tokenData;
        const userArray = [
            enum_index_1.UsertypeEnum.CUSTOMER,
            enum_index_1.UsertypeEnum.SUPERADMIN,
            enum_index_1.UsertypeEnum.VENDOR,
        ];
        if (!userArray.includes(userData.usertype))
            return res
                .status(403)
                .json({ message: "Cannot access the resource", code: "403", data: {} });
        (0, mongodb_config_1.connection)();
        next();
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Whoops! Something went wrong", code: "500", data: {} });
    }
});
exports.default = InterUserMiddleware;
