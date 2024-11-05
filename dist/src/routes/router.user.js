"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signup_google_1 = __importDefault(require("../controllers/authentication/signup/signup.google"));
const userRouter = express_1.default.Router();
userRouter.post("/create/use-google", signup_google_1.default);
exports.default = userRouter;
