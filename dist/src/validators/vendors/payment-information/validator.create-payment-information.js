"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePaymentInformationCreationValidator = void 0;
const method_string_1 = require("../../../helpers/methods/method.string");
const static_index_1 = require("../../../lib/static/static.index");
const usePaymentInformationCreationValidator = (data, next) => {
    const { payment_account_name, payment_account_number, bank_name } = data;
    if ((0, method_string_1.cleanExcessWhiteSpaces)(payment_account_name).length === 0)
        return { error: "Account name is required" };
    const banks = static_index_1.Banks.map((bank) => bank.bankName);
    if (!banks.includes(bank_name))
        return { error: "Choose from our predefined banks" };
    if ((0, method_string_1.cleanExcessWhiteSpaces)(payment_account_number).length === 0)
        return { error: "Account number is required" };
    if (!static_index_1.Regex.NUMERICAL.test(payment_account_number))
        return { error: "Provide numerical entity for account number" };
    if (payment_account_number.length < 8 || payment_account_number.length > 20)
        return {
            error: "Account number must be a number that is 8 - 20 chars. long",
        };
    next();
};
exports.usePaymentInformationCreationValidator = usePaymentInformationCreationValidator;
