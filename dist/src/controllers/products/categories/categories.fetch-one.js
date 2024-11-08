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
const model_product_category_1 = __importDefault(require("../../../models/model.product-category"));
const FetchSingleProductCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.category_id))
            return res
                .status(400)
                .json({ message: "Bad request", code: "400", data: {} });
        const categoryId = (_b = req.query) === null || _b === void 0 ? void 0 : _b.category_id;
        if (!static_index_1.Regex.MONGOOBJECT.test(categoryId))
            return res
                .status(400)
                .json({ message: "Bad request", code: "400", data: {} });
        const categoryData = yield model_product_category_1.default.findById(categoryId).populate("subcategories");
        if (!categoryData)
            return res
                .status(404)
                .json({ message: "Category not found", code: "404", data: {} });
        const _c = categoryData === null || categoryData === void 0 ? void 0 : categoryData.toObject(), { categoryImageId } = _c, sendableCategory = __rest(_c, ["categoryImageId"]);
        return res.status(200).json({
            message: "",
            code: "200",
            data: { category: sendableCategory },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Whoops! Something went wrong",
            code: "500",
            data: {},
        });
    }
});
exports.default = FetchSingleProductCategory;
