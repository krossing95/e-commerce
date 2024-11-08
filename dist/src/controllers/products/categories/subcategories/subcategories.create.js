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
const validator_create_subcategory_1 = require("../../../../validators/product-categories/subcategories/validator.create-subcategory");
const model_product_category_1 = __importDefault(require("../../../../models/model.product-category"));
const model_subcategory_1 = __importDefault(require("../../../../models/model.subcategory"));
const CreateProductSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = ["categoryId", "subcategory"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve the request body
    const requestBody = req.body;
    const validate = (0, validator_create_subcategory_1.useProductSubcategoryCreationValidator)(requestBody, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // check the existence of the categoryId
            // check subcategory conflict on the categoryId
            const [categoryData, subcategoryWithSameName] = yield Promise.all([
                model_product_category_1.default.findById(requestBody.categoryId),
                model_subcategory_1.default.findOne({
                    categoryId: requestBody.categoryId,
                    subcategory: requestBody.subcategory,
                }),
            ]);
            if (!categoryData)
                return res
                    .status(404)
                    .json({ message: "Main category not found", code: "404", data: {} });
            if (categoryData.isDeleted)
                return res.status(403).json({
                    message: "Cannot assign subcategory to a deleted main category",
                    code: "403",
                    data: {},
                });
            if (subcategoryWithSameName)
                return res.status(409).json({
                    message: "A subcategory with same name already registered on the provided main category",
                    code: "409",
                    data: {},
                });
            // save the subcategory
            const newSubcategory = new model_subcategory_1.default({
                categoryId: requestBody.categoryId,
                subcategory: requestBody.subcategory,
            });
            const createdSubcategory = yield newSubcategory.save();
            // assign the new subcategory to the main category
            const addSubcategoryToMains = yield model_product_category_1.default.findByIdAndUpdate(requestBody.categoryId, { $push: { subcategories: createdSubcategory === null || createdSubcategory === void 0 ? void 0 : createdSubcategory._id } }, { new: true }).populate("subcategories");
            const _a = addSubcategoryToMains === null || addSubcategoryToMains === void 0 ? void 0 : addSubcategoryToMains.toObject(), { categoryImageId } = _a, sendableCategory = __rest(_a, ["categoryImageId"]);
            return res.status(201).json({
                message: "Product subcategory created successfully",
                code: "201",
                data: { subcategory: createdSubcategory, category: sendableCategory },
            });
        }
        catch (error) {
            console.log(error);
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
exports.default = CreateProductSubcategory;
