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
const middleware_jwt_data_1 = __importDefault(require("../../../../middlewares/middleware.jwt-data"));
const static_index_1 = require("../../../../lib/static/static.index");
const pagination_config_1 = require("../../../../configs/pagination/pagination.config");
const mongoose_1 = __importDefault(require("mongoose"));
const model_wishlist_1 = __importDefault(require("../../../../models/model.wishlist"));
const method_on_product_1 = require("../../../../helpers/methods/method.on-product");
const model_product_review_1 = __importDefault(require("../../../../models/model.product-review"));
const enum_index_1 = require("../../../../lib/enum/enum.index");
const FetchProductsInWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // retrieve the request.authorization data
        const tokenData = yield (0, middleware_jwt_data_1.default)(req);
        const tokenDataObjKeys = Object.keys(tokenData);
        if (!tokenDataObjKeys.includes("_id"))
            return res
                .status(401)
                .json({ message: "Authorization is required", code: "401", data: {} });
        const tokenDataObject = tokenData;
        // retrieve the query params
        const page = (_a = req.query) === null || _a === void 0 ? void 0 : _a.page;
        const pageDensity = (_b = req.query) === null || _b === void 0 ? void 0 : _b.resultsPerPage;
        const q = (_c = req.query) === null || _c === void 0 ? void 0 : _c.q;
        const orderBy = (_d = req.query) === null || _d === void 0 ? void 0 : _d.orderBy;
        const params = {
            page: !page ? 1 : !static_index_1.Regex.NUMERICAL.test(page) ? 1 : Number(page),
            pageDensity: !pageDensity
                ? Number(process.env.ECOM_PAGE_DENSITY)
                : !static_index_1.Regex.NUMERICAL.test(pageDensity)
                    ? Number(process.env.ECOM_PAGE_DENSITY)
                    : Number(pageDensity),
            q: q || "",
            orderBy: !orderBy
                ? "asc"
                : !["asc", "desc"].includes(orderBy)
                    ? "asc"
                    : orderBy.toLowerCase(),
        };
        const query = {
            customerId: tokenDataObject._id,
        };
        const regex = new RegExp(params.q, "i");
        // setup pagination values
        const { limit, page: pageNumber, skip, } = (0, pagination_config_1.paginationSetup)({ page: params.page, page_density: params.pageDensity });
        const sortOptions = { createdAt: params.orderBy };
        const results = yield model_wishlist_1.default.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sortOptions)
            .populate([
            {
                path: "customerId",
                select: "-password -mfaActivated -mfaActivatedAt -usertype -usertype -gender -isVerified -isDeleted -isSocial",
            },
            {
                path: "productId",
                match: {
                    $and: [
                        { isDeleted: false },
                        { publishingStatus: enum_index_1.ProductPublishingStatusEnum.PUBLISHED },
                        {
                            $or: [
                                { productName: { $regex: regex } },
                                { color: { $regex: regex } },
                                { plainTextDescription: { $regex: regex } },
                                { region: { $regex: regex } },
                                { district: { $regex: regex } },
                                { publishingStatus: { $regex: regex } },
                                { description: { $regex: regex } },
                                { tags: { $in: [regex] } },
                            ],
                        },
                    ],
                },
                populate: [
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
                ],
            },
        ])
            .exec();
        const sendableWishlistedProductList = results
            .filter((result) => result.productId !== null)
            .map((result) => {
            const { customerId, productId: product } = result.toObject();
            // calculate discounted price
            const discountedPrice = (0, method_on_product_1.discountCalculation)({
                price: product.price,
                discount: product.discount,
            });
            //   extract unwanted product props from the product
            const { categoryId, vendorId, subcategoryId } = product, sendable = __rest(product, ["categoryId", "vendorId", "subcategoryId"]);
            const returnableWishlistedProduct = Object.assign(Object.assign({}, sendable), { category: product.categoryId, subcategory: product.subcategoryId, vendor: product.vendorId, productImages: product === null || product === void 0 ? void 0 : product.productImages.map((img) => img.productImageUrl), discountedPrice, starRating: 0 });
            return returnableWishlistedProduct;
        });
        const totalCount = sendableWishlistedProductList.length;
        const meta_data = {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNumber,
            pageSize: limit,
        };
        // get the rates for each of the products
        const productIds = sendableWishlistedProductList.map((product) => product === null || product === void 0 ? void 0 : product._id.toString());
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
        const sendableWishlistedProductListWtRates = sendableWishlistedProductList.map((product) => {
            rates.map((rate) => {
                if (rate.product_id.toString() === product._id.toString()) {
                    product.starRating = rate.rate;
                }
            });
            return product;
        });
        const returnableData = JSON.parse(JSON.stringify({
            collection: sendableWishlistedProductListWtRates,
            meta_data,
        }));
        return res
            .status(200)
            .json({ message: "", code: "200", data: Object.assign({}, returnableData) });
    }
    catch (error) {
        return res.status(500).json({
            message: "Whoops! Something went wrong",
            code: "500",
            data: {},
        });
    }
});
exports.default = FetchProductsInWishlist;
