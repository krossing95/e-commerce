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
const middleware_jwt_data_1 = __importDefault(require("../../../middlewares/middleware.jwt-data"));
const static_index_1 = require("../../../lib/static/static.index");
const pagination_config_1 = require("../../../configs/pagination/pagination.config");
const model_product_1 = __importDefault(require("../../../models/model.product"));
const method_on_product_1 = require("../../../helpers/methods/method.on-product");
const FetchProductsByVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
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
        const isActive = (_a = req.query) === null || _a === void 0 ? void 0 : _a.isActive;
        const page = (_b = req.query) === null || _b === void 0 ? void 0 : _b.page;
        const pageDensity = (_c = req.query) === null || _c === void 0 ? void 0 : _c.resultsPerPage;
        const q = (_d = req.query) === null || _d === void 0 ? void 0 : _d.q;
        const orderBy = (_e = req.query) === null || _e === void 0 ? void 0 : _e.orderBy;
        const params = {
            isActive: !isActive
                ? null
                : !["true", "false"].includes(isActive.toLowerCase())
                    ? null
                    : isActive.toLowerCase(),
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
        const regex = new RegExp(params.q, "i");
        const query = {
            $and: [
                { vendorId: tokenDataObject._id },
                ...(params.isActive === null ? [] : [{ isActive: params.isActive }]),
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
        };
        // setup pagination values
        const { limit, page: pageNumber, skip, } = (0, pagination_config_1.paginationSetup)({ page: params.page, page_density: params.pageDensity });
        const sortOptions = { createdAt: params.orderBy };
        const [totalCount, results] = yield Promise.all([
            model_product_1.default.countDocuments(query),
            model_product_1.default.find(query)
                .skip(skip)
                .limit(limit)
                .sort(sortOptions)
                .populate([
                {
                    path: "categoryId",
                    select: "-categoryImageId",
                },
                {
                    path: "subcategoryId",
                },
            ])
                .exec(),
        ]);
        const meta_data = {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNumber,
            pageSize: limit,
        };
        const sendableProductList = results.map((result) => {
            const _a = result.toObject(), { categoryId, subcategoryId, featuredImageId, productImages } = _a, restPoductInformation = __rest(_a, ["categoryId", "subcategoryId", "featuredImageId", "productImages"]);
            // calculate discounted price
            const discountedPrice = (0, method_on_product_1.discountCalculation)({
                price: restPoductInformation.price,
                discount: restPoductInformation.discount,
            });
            const returnableProduct = Object.assign(Object.assign({}, restPoductInformation), { category: categoryId, subcategory: subcategoryId, productImages: productImages.map((img) => img.productImageUrl), discountedPrice });
            return returnableProduct;
        });
        const returnableData = JSON.parse(JSON.stringify({
            collection: sendableProductList,
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
exports.default = FetchProductsByVendor;
