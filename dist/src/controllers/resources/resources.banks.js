"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_index_1 = require("../../lib/static/static.index");
const FetchBanks = (req, res) => {
    var _a, _b;
    const q = (_a = req.query) === null || _a === void 0 ? void 0 : _a.q;
    const bankType = (_b = req.query) === null || _b === void 0 ? void 0 : _b.bankType;
    const searchableBankType = !bankType
        ? null
        : !["mobile_money", "bank_account"].includes(bankType)
            ? null
            : bankType.toLowerCase();
    let banks = static_index_1.Banks;
    if (q) {
        const keyword = q.toLowerCase();
        banks = banks.filter((data) => JSON.stringify(data).toLowerCase().includes(keyword));
    }
    if (bankType) {
        banks = banks.filter((bank) => bank.bankType.toLowerCase() === searchableBankType);
    }
    return res.status(200).json({ message: "", code: "200", data: { banks } });
};
exports.default = FetchBanks;
