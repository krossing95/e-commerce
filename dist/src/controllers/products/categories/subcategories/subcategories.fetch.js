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
const static_index_1 = require("../../../../lib/static/static.index");
const pagination_config_1 = require("../../../../configs/pagination/pagination.config");
const model_subcategory_1 = __importDefault(require("../../../../models/model.subcategory"));
const FetchProductSubcategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        // retrieve the query params
        const isActive = (_a = req.query) === null || _a === void 0 ? void 0 : _a.isActive;
        const page = (_b = req.query) === null || _b === void 0 ? void 0 : _b.page;
        const pageDensity = (_c = req.query) === null || _c === void 0 ? void 0 : _c.resultsPerPage;
        const q = (_d = req.query) === null || _d === void 0 ? void 0 : _d.q;
        const orderBy = (_e = req.query) === null || _e === void 0 ? void 0 : _e.orderBy;
        const categoryId = (_f = req.query) === null || _f === void 0 ? void 0 : _f.categoryId;
        if (!categoryId)
            return res
                .status(400)
                .json({ message: "Category Id is required", code: "400", data: {} });
        if (!static_index_1.Regex.MONGOOBJECT.test(categoryId))
            return res
                .status(400)
                .json({ message: "Category Id is required", code: "400", data: {} });
        const params = {
            categoryId,
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
                { categoryId: params.categoryId },
                ...(params.isActive === null ? [] : [{ isActive: params.isActive }]),
                {
                    $or: [{ subcategory: { $regex: regex } }],
                },
            ],
        };
        // setup pagination values
        const { limit, page: pageNumber, skip, } = (0, pagination_config_1.paginationSetup)({ page: params.page, page_density: params.pageDensity });
        const sortOptions = { subcategory: params.orderBy };
        const [totalCount, results] = yield Promise.all([
            model_subcategory_1.default.countDocuments(query),
            model_subcategory_1.default.find(query)
                .skip(skip)
                .limit(limit)
                .sort(sortOptions)
                .populate("categoryId")
                .exec(),
        ]);
        const meta_data = {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNumber,
            pageSize: limit,
        };
        const sendableSubcategoryList = results.map((result) => {
            const _a = result === null || result === void 0 ? void 0 : result.toObject(), { categoryId } = _a, sendables = __rest(_a, ["categoryId"]);
            const { categoryImageId } = categoryId, category = __rest(categoryId, ["categoryImageId"]);
            return Object.assign(Object.assign({}, sendables), { category });
        });
        const returnableData = JSON.parse(JSON.stringify({
            collection: sendableSubcategoryList,
            meta_data,
        }));
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
exports.default = FetchProductSubcategories;
