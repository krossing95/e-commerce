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
const middleware_jwt_data_1 = __importDefault(require("../../../middlewares/middleware.jwt-data"));
const model_payment_information_1 = __importDefault(require("../../../models/model.payment-information"));
const FetchVendorsPaymentInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // retrieve the request.authorization data
        const tokenData = yield (0, middleware_jwt_data_1.default)(req);
        const tokenDataObjKeys = Object.keys(tokenData);
        if (!tokenDataObjKeys.includes("_id"))
            return res.status(401).json({
                message: "Authorization is required",
                code: "401",
                data: {},
            });
        const tokenDataObject = tokenData;
        const paymentInformation = yield model_payment_information_1.default.find({
            vendorId: tokenDataObject._id,
        });
        return res
            .status(200)
            .json({ message: "", code: "200", data: { paymentInformation } });
    }
    catch (error) {
        return res.status(500).json({
            message: "Whoops! Something went wrong",
            code: "500",
            data: {},
        });
    }
});
exports.default = FetchVendorsPaymentInformation;
