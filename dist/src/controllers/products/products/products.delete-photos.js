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
const static_index_1 = require("../../../lib/static/static.index");
const middleware_jwt_data_1 = __importDefault(require("../../../middlewares/middleware.jwt-data"));
const model_product_1 = __importDefault(require("../../../models/model.product"));
const enum_index_1 = require("../../../lib/enum/enum.index");
const destroy_1 = __importDefault(require("../../../helpers/image_system/destroy"));
const method_on_product_1 = require("../../../helpers/methods/method.on-product");
const DeleteProductPhotos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const expected_payload = ["product_id", "target_photo_urls"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve the request body
    const requestBody = req.body;
    if (!static_index_1.Regex.MONGOOBJECT.test(requestBody.product_id))
        return res
            .status(400)
            .json({ message: "Product ID is required", code: "400", data: {} });
    if (!Array.isArray(requestBody.target_photo_urls))
        return res.status(400).json({
            message: "Provide a list of URL of photos to remove from product",
            code: "400",
            data: {},
        });
    if (!requestBody.target_photo_urls.length)
        return res.status(400).json({
            message: "Provide a list of URL of photos to remove from product",
            code: "400",
            data: {},
        });
    try {
        // retrieve the request.authorization data
        const tokenData = yield (0, middleware_jwt_data_1.default)(req);
        const tokenDataObjKeys = Object.keys(tokenData);
        if (!tokenDataObjKeys.includes("_id"))
            return res
                .status(401)
                .json({ message: "Authorization is required", code: "401", data: {} });
        const tokenDataObject = tokenData;
        // retrieve the product
        const productData = yield model_product_1.default.findById(requestBody.product_id);
        if (!productData)
            return res
                .status(404)
                .json({ message: "Product not found", code: "404", data: {} });
        // check if the product is for the vendor
        if (tokenDataObject.usertype === enum_index_1.UsertypeEnum.VENDOR &&
            productData.vendorId.toString() !== tokenDataObject._id.toString()) {
            return res.status(403).json({
                message: "Access denied: You do not own this product",
                code: "403",
                data: {},
            });
        }
        // check if the urls provided are associated to the product
        const allProductPhotos = [
            {
                photoId: productData.featuredImageId,
                photoUrl: productData.featuredImage,
                isFeatured: true,
            },
            ...productData.productImages.map((img) => ({
                photoId: img.productImageId,
                photoUrl: img.productImageUrl,
                isFeatured: false,
            })),
        ];
        let allPhotosExists = true;
        let deletablePhotoData = [];
        for (let i = 0; i < requestBody.target_photo_urls.length; i++) {
            const url = requestBody.target_photo_urls[i];
            const productPhoto = (_a = allProductPhotos.filter((img) => img.photoUrl === url)) === null || _a === void 0 ? void 0 : _a[0];
            if (!productPhoto)
                allPhotosExists = false;
            deletablePhotoData = [
                ...deletablePhotoData,
                {
                    photoId: productPhoto === null || productPhoto === void 0 ? void 0 : productPhoto.photoId,
                    isFeatured: productPhoto === null || productPhoto === void 0 ? void 0 : productPhoto.isFeatured,
                },
            ];
        }
        if (!allPhotosExists || deletablePhotoData.length === 0)
            return res.status(400).json({
                message: "One or more provided photo URLs are not associated to the product",
                code: "400",
                data: {},
            });
        const deletablePhotoIds = deletablePhotoData
            .map((photo) => photo === null || photo === void 0 ? void 0 : photo.photoId)
            .filter((_) => _ !== null);
        if (deletablePhotoIds.length !== requestBody.target_photo_urls.length)
            return res.status(400).json({
                message: "One or more provided photo URLs are not associated to the product",
                code: "400",
                data: {},
            });
        const isRemovingFeaturedPhoto = deletablePhotoData.some((photo) => photo === null || photo === void 0 ? void 0 : photo.isFeatured);
        const updatedProduct = yield model_product_1.default.findByIdAndUpdate(requestBody.product_id, {
            $pull: {
                productImages: { productImageId: { $in: deletablePhotoIds } },
            },
            $set: {
                featuredImage: isRemovingFeaturedPhoto
                    ? null
                    : productData.featuredImage,
                featuredImageId: isRemovingFeaturedPhoto
                    ? null
                    : productData.featuredImageId,
                publishingStatus: isRemovingFeaturedPhoto
                    ? enum_index_1.ProductPublishingStatusEnum.DRAFTED
                    : productData.publishingStatus,
            },
        }, { new: true }).populate([
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
        if (!updatedProduct)
            return res.status(500).json({
                message: "Product photo removal failed",
                code: "500",
                data: {},
            });
        yield Promise.all(deletablePhotoIds.map((photoId) => (0, destroy_1.default)(photoId)));
        const _b = updatedProduct.toObject(), { vendorId, categoryId, subcategoryId, featuredImageId: fId, productImages } = _b, product = __rest(_b, ["vendorId", "categoryId", "subcategoryId", "featuredImageId", "productImages"]);
        // calculate discounted product
        const discountedPrice = (0, method_on_product_1.discountCalculation)({
            price: product.price,
            discount: product.discount,
        });
        const returnableData = Object.assign(Object.assign({}, product), { category: categoryId, vendor: vendorId, subcategory: subcategoryId, productImages: productImages.map((img) => img.productImageUrl), discountedPrice });
        return res.status(200).json({
            message: "Product photos removed successfully",
            code: "200",
            data: { product: returnableData },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Whoops! Something went wrong", code: "500", data: {} });
    }
});
exports.default = DeleteProductPhotos;
