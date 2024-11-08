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
const helper_request_1 = require("../../../../helpers/request/helper.request");
const validator_update_subcategory_1 = require("../../../../validators/product-categories/subcategories/validator.update-subcategory");
const model_product_category_1 = __importDefault(require("../../../../models/model.product-category"));
const model_subcategory_1 = __importDefault(require("../../../../models/model.subcategory"));
const UpdateProductSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = [
        "subcategory_id",
        "category_id",
        "subcategory",
        "is_active",
    ];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve the request body
    const requestBody = req.body;
    const validate = (0, validator_update_subcategory_1.useProductSubcategoryUpdationValidator)(requestBody, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // check if the category exists
            // check if the succategory is for the category
            // check for subcategory conflict
            const [categoryData, subcategoryData, subcategoryWithSameName] = yield Promise.all([
                model_product_category_1.default.findById(requestBody.category_id),
                model_subcategory_1.default.findOne({
                    categoryId: requestBody.category_id,
                    _id: requestBody.subcategory_id,
                }),
                model_subcategory_1.default.findOne({
                    categoryId: requestBody.category_id,
                    subcategory: requestBody.subcategory,
                }),
            ]);
            if (!categoryData)
                return res
                    .status(404)
                    .json({ message: "Main category not found", code: "404", data: {} });
            if (!subcategoryData)
                return res.status(404).json({
                    message: "Subcategory not found",
                    code: "404",
                    data: {},
                });
            if (subcategoryWithSameName) {
                if (subcategoryWithSameName._id.toString() !==
                    requestBody.subcategory_id)
                    return res.status(409).json({
                        message: "Subcategory with same name already registered on the provided main category",
                        code: "409",
                        data: {},
                    });
            }
            // update the subcategory
            const updatedSubcategory = yield model_subcategory_1.default.findByIdAndUpdate(requestBody.subcategory_id, {
                subcategory: requestBody.subcategory,
                isActive: requestBody.is_active,
            }, { new: true }).populate("categoryId");
            const _a = updatedSubcategory === null || updatedSubcategory === void 0 ? void 0 : updatedSubcategory.toObject(), { categoryId } = _a, sendableSubcategory = __rest(_a, ["categoryId"]);
            const { categoryImageId } = categoryId, category = __rest(categoryId, ["categoryImageId"]);
            const returnableData = Object.assign(Object.assign({}, sendableSubcategory), { category });
            return res.status(200).json({
                message: "Subcategory updated successfully",
                code: "200",
                data: { subcategory: returnableData },
            });
        }
        catch (error) {
            return res.status(500).json({
                message: "Whoops! Something went wrong",
                code: "500",
                data: {},
            });
        }
    }));
    if (validate !== undefined)
        return res
            .status(400)
            .json({ message: validate.error, code: "400", data: {} });
});
exports.default = UpdateProductSubcategory;
