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
const validator_create_category_1 = require("../../../validators/product-categories/validator.create-category");
const model_product_category_1 = __importDefault(require("../../../models/model.product-category"));
const storage_1 = __importDefault(require("../../../helpers/image_system/storage"));
const CreateProductCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = ["category", "description", "category_image"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve the request body
    const requestBody = req.body;
    const validate = (0, validator_create_category_1.useProductCategoryCreationValidator)(requestBody, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // check for category conflict
            const categoryWithSameName = yield model_product_category_1.default.findOne({
                category: requestBody.category,
            });
            if (categoryWithSameName)
                return res.status(409).json({
                    message: "Category with same name already created",
                    code: "409",
                    data: {},
                });
            let categoryImage = null;
            let categoryImageId = null;
            // upload the category image if exists
            if (requestBody.category_image) {
                const uploadImage = yield (0, storage_1.default)({
                    lastId: null,
                    photo_data: requestBody.category_image,
                    folder: "product-category",
                });
                categoryImage = uploadImage.secure_url || null;
                categoryImageId = uploadImage.photo_id || null;
            }
            //  create the category
            const newProductCategory = new model_product_category_1.default({
                category: requestBody.category,
                categoryImage,
                categoryImageId,
                description: requestBody.description,
            });
            const createdCategory = (_a = (yield newProductCategory.save())) === null || _a === void 0 ? void 0 : _a.toObject();
            const { categoryImageId: id } = createdCategory, sendableCategory = __rest(createdCategory, ["categoryImageId"]);
            return res.status(201).json({
                message: "Product category created",
                code: "201",
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
exports.default = CreateProductCategory;
