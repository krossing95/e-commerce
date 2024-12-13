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
const validator_create_product_1 = require("../../../validators/products/validator.create-product");
const model_product_category_1 = __importDefault(require("../../../models/model.product-category"));
const storage_1 = __importDefault(require("../../../helpers/image_system/storage"));
const method_html_sanitizer_1 = require("../../../helpers/methods/method.html-sanitizer");
const middleware_jwt_data_1 = __importDefault(require("../../../middlewares/middleware.jwt-data"));
const model_product_1 = __importDefault(require("../../../models/model.product"));
const method_on_product_1 = require("../../../helpers/methods/method.on-product");
const CreateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = [
        "category_id",
        "subcategory_id",
        "product_name",
        "quantity",
        "price",
        "discount",
        "color",
        "description",
        "region",
        "district",
        "featured_image",
        "product_images",
        "is_negotiable",
        "tags",
    ];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve the request body
    const requestBody = req.body;
    const validate = (0, validator_create_product_1.useProductCreationValidator)(requestBody, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // retrieve the request.authorization data
            const tokenData = yield (0, middleware_jwt_data_1.default)(req);
            const tokenDataObjKeys = Object.keys(tokenData);
            if (!tokenDataObjKeys.includes("_id"))
                return res
                    .status(401)
                    .json({ message: "Authorization is required", code: "401", data: {} });
            const tokenDataObject = tokenData;
            // check for the category_id
            const categoryData = yield model_product_category_1.default.findById(requestBody.category_id).populate("subcategories");
            if (!categoryData)
                return res.status(400).json({
                    message: "Provided category does not exist",
                    code: "400",
                    data: {},
                });
            if (categoryData.isDeleted || !categoryData.isActive)
                return res.status(403).json({
                    message: "Provided main category is not accessible",
                    code: "403",
                    data: {},
                });
            const subcategories = categoryData.subcategories;
            if (requestBody.subcategory_id) {
                const subcategoryData = subcategories.filter((subc) => { var _a; return ((_a = subc._id) === null || _a === void 0 ? void 0 : _a.toString()) === requestBody.subcategory_id; });
                if (subcategoryData.length !== 1)
                    return res.status(400).json({
                        message: "Provided subcategory does not exist on the main category",
                        code: "400",
                        data: {},
                    });
                const subcategory = subcategoryData[0];
                if (subcategory.isDeleted || !subcategory.isActive)
                    return res.status(403).json({
                        message: "Provided subcategory is not accessible",
                        code: "403",
                        data: {},
                    });
            }
            // upload product featured image if provided
            let featuredImage = null;
            let featuredImageId = null;
            if (requestBody.featured_image) {
                const uploadFeaturedImage = yield (0, storage_1.default)({
                    lastId: null,
                    photo_data: requestBody.featured_image,
                    folder: "products/featured-images",
                });
                featuredImage = uploadFeaturedImage.secure_url || null;
                featuredImageId = uploadFeaturedImage.photo_id || null;
            }
            // upload product images if any
            let productImagesArray = [];
            if (requestBody.product_images) {
                requestBody.product_images = requestBody.product_images.slice(0, 3);
                if (requestBody.product_images.length > 0) {
                    for (let i = 0; i < requestBody.product_images.length; i++) {
                        const productPhoto = requestBody.product_images[i];
                        const { photo_id, secure_url } = yield (0, storage_1.default)({
                            lastId: null,
                            photo_data: productPhoto,
                            folder: "products",
                        });
                        if (photo_id && secure_url) {
                            productImagesArray = [
                                ...productImagesArray,
                                { productImageId: photo_id, productImageUrl: secure_url },
                            ];
                        }
                    }
                }
            }
            // generate plain text from description (html) if provided
            let plainTextDescription = null;
            if (requestBody.description) {
                plainTextDescription = (0, method_html_sanitizer_1.generatePlainTextFromHtml)(requestBody.description);
            }
            // save the product
            const newProduct = new model_product_1.default({
                vendorId: tokenDataObject._id,
                categoryId: requestBody.category_id,
                subcategoryId: typeof requestBody.subcategory_id === "string"
                    ? requestBody.subcategory_id
                    : null,
                productName: requestBody.product_name,
                quantity: typeof requestBody.quantity === "number"
                    ? Math.abs(requestBody.quantity)
                    : null,
                price: typeof requestBody.price === "number"
                    ? Math.abs(requestBody.price)
                    : null,
                discount: typeof requestBody.discount === "number"
                    ? Math.abs(requestBody.discount)
                    : null,
                color: typeof requestBody.color === "string" ? requestBody.color : null,
                description: typeof requestBody.description === "string"
                    ? requestBody.description
                    : null,
                plainTextDescription,
                region: typeof requestBody.region === "string" ? requestBody.region : null,
                district: typeof requestBody.district === "string"
                    ? requestBody.district
                    : null,
                featuredImage,
                featuredImageId,
                productImages: productImagesArray,
                isNegotiable: typeof requestBody.is_negotiable === "boolean"
                    ? requestBody.is_negotiable
                    : null,
                tags: Array.isArray(requestBody.tags) ? requestBody.tags : null,
            });
            const createdProduct = yield newProduct.save();
            const product = yield model_product_1.default.findById(createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct._id).populate([
                {
                    path: "vendorId",
                    select: "-password -photoId -mfaActivated -mfaDisabledAt",
                },
                {
                    path: "categoryId",
                    select: "-categoryImageId",
                },
                {
                    path: "subcategoryId",
                },
            ]);
            if (!product)
                return res.status(500).json({
                    message: "Product creation has failed",
                    code: "500",
                    data: {},
                });
            const _a = product.toObject(), { vendorId, categoryId, subcategoryId, featuredImageId: fId, productImages } = _a, restPoductInformation = __rest(_a, ["vendorId", "categoryId", "subcategoryId", "featuredImageId", "productImages"]);
            // calculate discounted price
            const discountedPrice = (0, method_on_product_1.discountCalculation)({
                price: restPoductInformation.price,
                discount: restPoductInformation.discount,
            });
            const returnableData = Object.assign(Object.assign({}, restPoductInformation), { category: categoryId, vendor: vendorId, subcategory: subcategoryId, productImages: productImages.map((img) => img.productImageUrl), discountedPrice });
            return res.status(201).json({
                message: "New product is created",
                code: "201",
                data: { product: returnableData },
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
exports.default = CreateProduct;
