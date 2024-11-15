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
const static_index_1 = require("../../../lib/static/static.index");
const model_product_1 = __importDefault(require("../../../models/model.product"));
const mongoose_1 = __importDefault(require("mongoose"));
const method_on_product_1 = require("../../../helpers/methods/method.on-product");
const model_product_review_1 = __importDefault(require("../../../models/model.product-review"));
const enum_index_1 = require("../../../lib/enum/enum.index");
const FetchASingleProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.productId))
            return res
                .status(400)
                .json({ message: "Product ID is required", code: "400", data: {} });
        const productId = (_b = req.query) === null || _b === void 0 ? void 0 : _b.productId;
        const isPublished = (_c = req.query) === null || _c === void 0 ? void 0 : _c.isPublished;
        const refinedPublishingStatus = !isPublished
            ? enum_index_1.ProductPublishingStatusEnum.PUBLISHED
            : !["true", "false"].includes(isPublished.toLowerCase())
                ? enum_index_1.ProductPublishingStatusEnum.PUBLISHED
                : isPublished.toLowerCase() === "false"
                    ? enum_index_1.ProductPublishingStatusEnum.DRAFTED
                    : enum_index_1.ProductPublishingStatusEnum.PUBLISHED;
        if (!static_index_1.Regex.MONGOOBJECT.test(productId))
            return res
                .status(400)
                .json({ message: "Product ID is required", code: "400", data: {} });
        // find the product by ID
        const productData = yield model_product_1.default.findOne({ productId, publishingStatus: refinedPublishingStatus }).populate([
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
        ]);
        if (!productData)
            return res
                .status(404)
                .json({ message: "Product not found", code: "404", data: {} });
        const _e = productData.toObject(), { categoryId, subcategoryId, featuredImageId, productImages } = _e, restProductInformation = __rest(_e, ["categoryId", "subcategoryId", "featuredImageId", "productImages"]);
        // calculate discounted price
        const discountedPrice = (0, method_on_product_1.discountCalculation)({
            price: restProductInformation.price,
            discount: restProductInformation.discount,
        });
        const returnableProduct = Object.assign(Object.assign({}, restProductInformation), { category: categoryId, subcategory: subcategoryId, productImages: productImages.map((img) => img.productImageUrl), discountedPrice, starRating: 0 });
        // retrieve the average rate
        const averageRateResult = yield model_product_review_1.default.aggregate([
            {
                $match: {
                    productId: new mongoose_1.default.Types.ObjectId(productId),
                    isDeleted: false,
                },
            },
            { $group: { _id: "$productId", averageRate: { $avg: "$rate" } } },
        ]);
        const averageRate = averageRateResult.length > 0
            ? averageRateResult[0].averageRate
            : 0;
        returnableProduct.starRating = averageRate;
        // retrieve 10 related products based on the category and subcategory
        const relatedProducts = yield model_product_1.default.find({
            $and: [
                { isDeleted: false },
                { _id: { $ne: new mongoose_1.default.Types.ObjectId(productId) } },
                { categoryId: returnableProduct.category._id },
                { publishingStatus: enum_index_1.ProductPublishingStatusEnum.PUBLISHED },
                {
                    $or: [{ subcategoryId: (_d = returnableProduct.subcategory) === null || _d === void 0 ? void 0 : _d._id }],
                },
            ],
        })
            .populate([
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
        ])
            .limit(10);
        const sendableRelatedProductList = relatedProducts.map((relatedProduct) => {
            const _a = relatedProduct.toObject(), { categoryId, subcategoryId, featuredImageId, productImages } = _a, restRelatedProductInformation = __rest(_a, ["categoryId", "subcategoryId", "featuredImageId", "productImages"]);
            // calculate discounted price
            const discountedPrice = (0, method_on_product_1.discountCalculation)({
                price: restRelatedProductInformation.price,
                discount: restRelatedProductInformation.discount,
            });
            const returnableRelatedProduct = Object.assign(Object.assign({}, restRelatedProductInformation), { category: categoryId, subcategory: subcategoryId, productImages: productImages.map((img) => img.productImageUrl), discountedPrice, starRating: 0 });
            return returnableRelatedProduct;
        });
        // get the rates for each of the related products
        const productIds = sendableRelatedProductList.map((relatedProduct) => relatedProduct._id.toString());
        let rates = [];
        if (productIds.length > 0) {
            for (let i = 0; i < productIds.length; i++) {
                const productId = productIds[i];
                const result = yield model_product_review_1.default.aggregate([
                    {
                        $match: {
                            productId: new mongoose_1.default.Types.ObjectId(productId),
                            isDeleted: false,
                        },
                    },
                    { $group: { _id: "$productId", averageRate: { $avg: "$rate" } } },
                ]);
                const averageRate = result.length > 0 ? result[0].averageRate : 0;
                rates = [...rates, { product_id: productId, rate: averageRate }];
            }
        }
        const sendableRelatedProductListWtRates = sendableRelatedProductList.map((relatedProduct) => {
            rates.map((rate) => {
                if (rate.product_id.toString() === relatedProduct._id.toString()) {
                    relatedProduct.starRating = rate.rate;
                }
            });
            return relatedProduct;
        });
        // retrieve the reviews and rates
        const [reviewsAndRate, reviewCount] = yield Promise.all([
            model_product_review_1.default.find({
                productId,
            }).populate([
                {
                    path: "customerId",
                    select: "-password -mfaActivated -mfaActivatedAt",
                },
            ]),
            model_product_review_1.default.countDocuments({
                productId,
            }),
        ]);
        const sendableReviewsAndRate = reviewsAndRate.map((review) => {
            const _a = review.toObject(), { productId, customerId } = _a, sendableReview = __rest(_a, ["productId", "customerId"]);
            return Object.assign(Object.assign({}, sendableReview), { customer: customerId });
        });
        const returnableData = {
            product: returnableProduct,
            totalReviews: reviewCount,
            relatedProducts: sendableRelatedProductListWtRates,
            reviews: sendableReviewsAndRate,
        };
        return res
            .status(200)
            .json({ message: "", code: "200", data: Object.assign({}, returnableData) });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Whoops! Something went wrong", code: "500", data: {} });
    }
});
exports.default = FetchASingleProduct;
