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
const helper_request_1 = require("../../../helpers/request/helper.request");
const validator_create_payment_information_1 = require("../../../validators/vendors/payment-information/validator.create-payment-information");
const middleware_jwt_data_1 = __importDefault(require("../../../middlewares/middleware.jwt-data"));
const enum_index_1 = require("../../../lib/enum/enum.index");
const model_payment_information_1 = __importDefault(require("../../../models/model.payment-information"));
const static_index_1 = require("../../../lib/static/static.index");
const CreatePaymentInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = [
        "payment_account_name",
        "payment_account_number",
        "bank_name",
    ];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve the request body
    const requestBody = req.body;
    const validate = (0, validator_create_payment_information_1.usePaymentInformationCreationValidator)(requestBody, () => __awaiter(void 0, void 0, void 0, function* () {
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
            if (tokenDataObject.usertype !== enum_index_1.UsertypeEnum.VENDOR)
                return res.status(403).json({
                    message: "Only vendors are allowed to add payment information",
                    code: "403",
                    data: {},
                });
            //   get provided bank details
            const bank = static_index_1.Banks.filter((bank) => bank.bankName === requestBody.bank_name);
            if (bank.length === 0)
                return res.status(400).json({
                    message: "Choose from our predefined banks",
                    code: "400",
                    data: {},
                });
            const bankData = bank[0];
            // retrieve the vendor's payment information
            const [paymentInformation, accountNumberExists] = yield Promise.all([
                model_payment_information_1.default.find({
                    vendorId: tokenDataObject._id,
                }),
                model_payment_information_1.default.findOne({
                    vendorId: tokenDataObject._id,
                    paymentAccountNumber: requestBody.payment_account_number,
                }),
            ]);
            if (paymentInformation.length === 2)
                return res.status(403).json({
                    message: "Cannot register more than 2 payment accounts",
                    code: "403",
                    data: {},
                });
            // check if the provided account number exists in existing account numbers
            if (accountNumberExists)
                return res.status(409).json({
                    message: "Payment account number already added",
                    code: "409",
                    data: {},
                });
            const newPaymentInformation = new model_payment_information_1.default({
                vendorId: tokenDataObject._id,
                paymentAccountType: bankData.bankType,
                bankName: bankData.bankName,
                paymentAccountName: requestBody.payment_account_name,
                paymentAccountNumber: requestBody.payment_account_number,
            });
            yield newPaymentInformation.save();
            const createdPaymentInformation = yield model_payment_information_1.default.findById(newPaymentInformation === null || newPaymentInformation === void 0 ? void 0 : newPaymentInformation._id);
            if (!createdPaymentInformation)
                return res.status(500).json({
                    message: "Payment information creation has failed",
                    code: "500",
                    data: {},
                });
            return res.status(201).json({
                message: "Payment information created",
                code: "201",
                data: { paymentInformation: createdPaymentInformation.toObject() },
            });
        }
        catch (error) {
            return res.status(500).json({
                message: "Whoops! Something went wrong",
                code: "500",
                data: {},
            });
        }
    }));
    if (validate !== undefined)
        return res
            .status(400)
            .json({ message: validate.error, code: "400", data: {} });
});
exports.default = CreatePaymentInformation;
