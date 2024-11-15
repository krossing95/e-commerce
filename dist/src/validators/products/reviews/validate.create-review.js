"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProductReviewCreationPayload = void 0;
const static_index_1 = require("../../../lib/static/static.index");
const useProductReviewCreationPayload = (data, next) => {
    const { product_id, rate, review } = data;
    if (!static_index_1.Regex.MONGOOBJECT.test(product_id))
        return { error: "Product ID is required" };
    if (typeof rate !== "number" && typeof review !== "string")
        return { error: "Provide either a star rate or a product review" };
    if (typeof rate === "number") {
        if (rate < 1 || rate > 5)
            return { error: "Star rate must be a number between 1 & 5" };
    }
    next();
};
exports.useProductReviewCreationPayload = useProductReviewCreationPayload;
