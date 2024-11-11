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
                if (subcategoryData.length === 0)
                    return res.status(400).json({
                        message: "Provided subcategory does not exist on the main category",
                        code: "400",
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
            const discountedPrice = !(createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct.price)
                ? null
                : !(createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct.discount)
                    ? null
                    : Number(Number(createdProduct.price -
                        (createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct.price) * ((createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct.discount) / 100)).toFixed(2));
            return res.status(201).json({
                message: "New product is created",
                code: "201",
                data: { product: Object.assign(Object.assign({}, createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct.toObject()), { discountedPrice }) },
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
