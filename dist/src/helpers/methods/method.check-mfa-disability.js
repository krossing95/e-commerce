"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMfaEligibility = void 0;
const method_date_1 = require("./method.date");
const checkMfaEligibility = (hasMfa, mfaDisabledAt) => {
    const timestamp = (0, method_date_1.currentTimestamp)();
    if (!hasMfa)
        return { useMfa: false };
    if (!process.env.ECOM_MFA_DISABILITY_TIME)
        return { useMfa: true };
    if (mfaDisabledAt) {
        if (timestamp - mfaDisabledAt <
            Number(process.env.ECOM_MFA_DISABILITY_TIME))
            return { useMfa: false };
    }
    return { useMfa: true };
};
exports.checkMfaEligibility = checkMfaEligibility;
