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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProductWithStarRates = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const model_product_1 = __importDefault(require("../../../../models/model.product"));
const model_product_review_1 = __importDefault(require("../../../../models/model.product-review"));
const method_on_product_1 = require("../../../../helpers/methods/method.on-product");
const fetchProductWithStarRates = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const [retrievePotentialSendableProductData, retrieveAverageStarRate, reviewsAndRate,] = yield Promise.all([
            model_product_1.default.findOne({
                productId,
            }).populate([
                {
                    path: "categoryId",
                    select: "-categoryImageId",
                },
                {
                    path: "subcategoryId",
                },
                {
                    path: "vendorId",
                    select: "-password -mfaActivated -mfaActivatedAt",
                },
            ]),
            model_product_review_1.default.aggregate([
                {
                    $match: {
                        productId: new mongoose_1.default.Types.ObjectId(productId),
                        isDeleted: false,
                    },
                },
                {
                    $group: { _id: "$productId", averageRate: { $avg: "$rate" } },
                },
            ]),
            model_product_review_1.default.find({
                productId,
            }).populate([
                {
                    path: "customerId",
                    select: "-password -mfaActivated -mfaActivatedAt -usertype -usertype -gender -isVerified -isDeleted -isSocial",
                },
            ]),
        ]);
        if (!retrievePotentialSendableProductData)
            return null;
        const _b = retrievePotentialSendableProductData.toObject(), { categoryId, subcategoryId, featuredImageId, productImages } = _b, restProductInformation = __rest(_b, ["categoryId", "subcategoryId", "featuredImageId", "productImages"]);
        // calculate discounted price
        const discountedPrice = (0, method_on_product_1.discountCalculation)({
            price: restProductInformation.price,
            discount: restProductInformation.discount,
        });
        const returnableProduct = Object.assign(Object.assign({}, restProductInformation), { category: categoryId, subcategory: subcategoryId, productImages: productImages.map((img) => img.productImageUrl), discountedPrice, starRating: retrieveAverageStarRate.length > 0
                ? (_a = retrieveAverageStarRate === null || retrieveAverageStarRate === void 0 ? void 0 : retrieveAverageStarRate[0]) === null || _a === void 0 ? void 0 : _a.averageRate
                : 0 });
        const sendableReviewsAndRate = reviewsAndRate.map((review) => {
            const _a = review.toObject(), { productId, customerId } = _a, sendableReview = __rest(_a, ["productId", "customerId"]);
            return Object.assign(Object.assign({}, sendableReview), { customer: customerId });
        });
        return Object.assign(Object.assign({}, returnableProduct), { reviews: sendableReviewsAndRate });
    }
    catch (error) {
        return null;
    }
});
exports.fetchProductWithStarRates = fetchProductWithStarRates;
