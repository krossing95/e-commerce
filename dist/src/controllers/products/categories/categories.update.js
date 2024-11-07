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
const helper_request_1 = require("../../../helpers/request/helper.request");
const validator_update_category_1 = require("../../../validators/product-categories/validator.update-category");
const model_product_category_1 = __importDefault(require("../../../models/model.product-category"));
const storage_1 = __importDefault(require("../../../helpers/image_system/storage"));
const UpdateProductCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = [
        "category_id",
        "category",
        "description",
        "category_image",
        "is_active",
    ];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve the request body
    const requestBody = req.body;
    const validate = (0, validator_update_category_1.useProductCategoryUpdationValidator)(requestBody, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // retrieve the category
            // check for category conflict
            const [categoryData, categoryWithSameName] = yield Promise.all([
                model_product_category_1.default.findById(requestBody.category_id),
                model_product_category_1.default.findOne({
                    category: requestBody.category,
                }),
            ]);
            if (!categoryData)
                return res
                    .status(404)
                    .json({ message: "Category not found", code: "404", data: {} });
            if (categoryWithSameName) {
                if (categoryWithSameName._id.toString() !== requestBody.category_id)
                    return res.status(409).json({
                        message: "A category with same name already exists",
                        code: "409",
                        data: {},
                    });
            }
            // upload image if exists
            let categoryImage = categoryData.categoryImage;
            let categoryImageId = categoryData.categoryImageId;
            if (requestBody.category_image) {
                const uploadImage = yield (0, storage_1.default)({
                    lastId: categoryData.categoryImageId,
                    photo_data: requestBody.category_image,
                    folder: "product-category",
                });
                categoryImage = uploadImage.secure_url || categoryData.categoryImage;
                categoryImageId = uploadImage.photo_id || categoryData.categoryImageId;
            }
            // update the category
            const updatedCategory = yield model_product_category_1.default.findByIdAndUpdate(requestBody.category_id, {
                category: requestBody.category,
                categoryImage,
                categoryImageId,
                description: requestBody.description,
                isActive: requestBody.is_active,
            }, { new: true });
            const _a = updatedCategory === null || updatedCategory === void 0 ? void 0 : updatedCategory.toObject(), { categoryImageId: id } = _a, sendableCategory = __rest(_a, ["categoryImageId"]);
            return res.status(200).json({
                message: "Product category updated succesfully",
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
    }));
    if (validate !== undefined)
        return res
            .status(400)
            .json({ message: validate.error, code: "400", data: {} });
});
exports.default = UpdateProductCategory;
