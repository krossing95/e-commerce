"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalRequestStatusEnum = exports.PaymentInformationType = exports.GenderEnum = exports.UsertypeEnum = void 0;
var UsertypeEnum;
(function (UsertypeEnum) {
    UsertypeEnum["CUSTOMER"] = "customer";
    UsertypeEnum["VENDOR"] = "vendor";
    UsertypeEnum["SUPERADMIN"] = "superadmin";
})(UsertypeEnum || (exports.UsertypeEnum = UsertypeEnum = {}));
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["UNKNOWN"] = "";
    GenderEnum["MALE"] = "male";
    GenderEnum["FEMALE"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var PaymentInformationType;
(function (PaymentInformationType) {
    PaymentInformationType["BANK_ACCOUNT"] = "bank_account";
    PaymentInformationType["MOBILE_MONEY"] = "mobile_money";
})(PaymentInformationType || (exports.PaymentInformationType = PaymentInformationType = {}));
var WithdrawalRequestStatusEnum;
(function (WithdrawalRequestStatusEnum) {
    WithdrawalRequestStatusEnum["PENDING"] = "pending";
    WithdrawalRequestStatusEnum["CREDITED"] = "credited";
})(WithdrawalRequestStatusEnum || (exports.WithdrawalRequestStatusEnum = WithdrawalRequestStatusEnum = {}));
