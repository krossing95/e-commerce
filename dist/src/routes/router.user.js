"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signup_google_1 = __importDefault(require("../controllers/authentication/signup/signup.google"));
const middleware_connection_1 = require("../middlewares/middleware.connection");
const signup_email_password_1 = __importDefault(require("../controllers/authentication/signup/signup.email-password"));
const signup_resend_1 = __importDefault(require("../controllers/authentication/signup/signup.resend"));
const signup_verify_1 = __importDefault(require("../controllers/authentication/signup/signup.verify"));
const signin_google_1 = __importDefault(require("../controllers/authentication/signin/signin.google"));
const signin_resend_1 = __importDefault(require("../controllers/authentication/signin/signin.resend"));
const signin_email_password_1 = __importDefault(require("../controllers/authentication/signin/signin.email-password"));
const signin_verify_1 = __importDefault(require("../controllers/authentication/signin/signin.verify"));
const passwords_request_1 = __importDefault(require("../controllers/authentication/passwords/passwords.request"));
const passwords_reset_1 = __importDefault(require("../controllers/authentication/passwords/passwords.reset"));
const userRouter = express_1.default.Router();
userRouter.post("/create/use-google", middleware_connection_1.ConnectionMiddleware, signup_google_1.default);
userRouter.post("/create/use-email-password", middleware_connection_1.ConnectionMiddleware, signup_email_password_1.default);
userRouter.post("/create/resend-link", middleware_connection_1.ConnectionMiddleware, signup_resend_1.default);
userRouter.patch("/create/verify-user", middleware_connection_1.ConnectionMiddleware, signup_verify_1.default);
// login routes
userRouter.post("/login/use-google", middleware_connection_1.ConnectionMiddleware, signin_google_1.default);
userRouter.post("/login/use-email-password", middleware_connection_1.ConnectionMiddleware, signin_email_password_1.default);
userRouter.post("/login/resend-otp", middleware_connection_1.ConnectionMiddleware, signin_resend_1.default);
userRouter.post("/login/verify-otp", middleware_connection_1.ConnectionMiddleware, signin_verify_1.default);
userRouter.post("/password-reset/request-link", middleware_connection_1.ConnectionMiddleware, passwords_request_1.default);
userRouter.patch("/password-reset/reset", middleware_connection_1.ConnectionMiddleware, passwords_reset_1.default);
exports.default = userRouter;