"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_vendor_1 = __importDefault(require("../middlewares/middleware.vendor"));
const vendors_payment_information_create_1 = __importDefault(require("../controllers/vendors/payment-informations/vendors.payment-information.create"));
const vendors_payment_information_fetch_1 = __importDefault(require("../controllers/vendors/payment-informations/vendors.payment-information.fetch"));
const vendorRoutes = express_1.default.Router();
vendorRoutes.post("/payment-information/create", middleware_vendor_1.default, vendors_payment_information_create_1.default);
vendorRoutes.get("/payment-information", middleware_vendor_1.default, vendors_payment_information_fetch_1.default);
exports.default = vendorRoutes;
