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
const model_product_1 = __importDefault(require("../../../models/model.product"));
const model_sale_1 = __importDefault(require("../../../models/model.sale"));
const enum_index_1 = require("../../../lib/enum/enum.index");
const method_on_product_1 = require("../../../helpers/methods/method.on-product");
const destroy_1 = __importDefault(require("../../../helpers/image_system/destroy"));
const model_product_review_1 = __importDefault(require("../../../models/model.product-review"));
const model_wishlist_1 = __importDefault(require("../../../models/model.wishlist"));
const middleware_jwt_data_1 = __importDefault(require("../../../middlewares/middleware.jwt-data"));
const DeleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.productId))
            return res
                .status(400)
                .json({ message: "Product ID is required", code: "400", data: {} });
        const productId = (_b = req.query) === null || _b === void 0 ? void 0 : _b.productId;
        if (!static_index_1.Regex.MONGOOBJECT.test(productId))
            return res
                .status(400)
                .json({ message: "Product ID is required", code: "400", data: {} });
        // retrieve the request.authorization data
        const tokenData = yield (0, middleware_jwt_data_1.default)(req);
        const tokenDataObjKeys = Object.keys(tokenData);
        if (!tokenDataObjKeys.includes("_id"))
            return res
                .status(401)
                .json({ message: "Authorization is required", code: "401", data: {} });
        const tokenDataObject = tokenData;
        // retrieve the product
        const [productData, productInSales] = yield Promise.all([
            model_product_1.default.findById(productId),
            model_sale_1.default.findOne({ products: productId }),
        ]);
        if (!productData)
            return res
                .status(404)
                .json({ message: "Product not found", code: "404", data: {} });
        // check if the product is for the vendor
        if (tokenDataObject.usertype === enum_index_1.UsertypeEnum.VENDOR) {
            if (productData.vendorId.toString() !== tokenDataObject._id.toString())
                return res.status(403).json({
                    message: "Access to the resource has been denied",
                    code: "403",
                    data: {},
                });
        }
        // check if the product has ever been sold
        if (productInSales) {
            // soft-delete the product
            const softDeleteProduct = yield model_product_1.default.findByIdAndUpdate(productId, {
                isDeleted: true,
                publishingStatus: enum_index_1.ProductPublishingStatusEnum.DRAFTED,
            }, { new: true }).populate([
                {
                    path: "categoryId",
                    select: "-categoryImageId",
                },
                {
                    path: "subcategoryId",
                },
                {
                    path: "vendorId",
                    select: "-password -mfaActivated -mfaActivatedAt",
                },
            ]);
            if (!softDeleteProduct)
                return res
                    .status(404)
                    .json({ message: "Product not found", code: "404", data: {} });
            const _c = softDeleteProduct.toObject(), { categoryId, subcategoryId, featuredImageId, productImages } = _c, restProductInformation = __rest(_c, ["categoryId", "subcategoryId", "featuredImageId", "productImages"]);
            // calculate discounted price
            const discountedPrice = (0, method_on_product_1.discountCalculation)({
                price: restProductInformation.price,
                discount: restProductInformation.discount,
            });
            const returnableProduct = Object.assign(Object.assign({}, restProductInformation), { category: categoryId, subcategory: subcategoryId, productImages: productImages.map((img) => img.productImageUrl), discountedPrice });
            return res.status(200).json({
                message: "Product was partially deleted",
                code: "200",
                data: {
                    product: returnableProduct,
                    meta_data: {
                        miscellaneous: [
                            {
                                name: "product_deletion",
                                data: "The product has a sales history. To preserve its transactional records, it has been partially removed from active listings, ensuring it remains hidden from customer view.",
                            },
                        ],
                    },
                },
            });
        }
        // permanently delete the product
        const detailedProduct = (yield productData.populate([
            {
                path: "categoryId",
                select: "-categoryImageId",
            },
            {
                path: "subcategoryId",
            },
            {
                path: "vendorId",
                select: "-password -mfaActivated -mfaActivatedAt",
            },
        ]));
        const _d = detailedProduct.toObject(), { categoryId, subcategoryId, featuredImageId, productImages } = _d, deletedProductInformation = __rest(_d, ["categoryId", "subcategoryId", "featuredImageId", "productImages"]);
        // calculate discounted price
        const discountedPrice = (0, method_on_product_1.discountCalculation)({
            price: deletedProductInformation.price,
            discount: deletedProductInformation.discount,
        });
        const returnableDeletedProduct = Object.assign(Object.assign({}, deletedProductInformation), { category: categoryId, subcategory: subcategoryId, productImages: productImages.map((img) => img.productImageUrl), discountedPrice });
        // delete the product
        // delete all reviews
        // delete from wishlists
        yield Promise.all([
            productData.deleteOne(),
            model_product_review_1.default.deleteMany({ productId }),
            model_wishlist_1.default.deleteMany({ productId }),
        ]);
        // delete the associated images
        const imagelist = [
            productData.featuredImageId,
            ...productData.productImages.map((img) => img.productImageId),
        ].filter((photoId) => photoId !== null);
        if (imagelist.length > 0) {
            for (let i = 0; i < imagelist.length; i++) {
                const photoId = imagelist[i];
                yield (0, destroy_1.default)(photoId);
            }
        }
        return res.status(200).json({
            message: "Product was permanently deleted",
            code: "200",
            data: {
                product: returnableDeletedProduct,
                meta_data: {
                    miscellaneous: [
                        {
                            name: "product_deletion",
                            data: "The product was deleted permanently along with related data",
                        },
                    ],
                },
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Whoops! Something went wrong", code: "500", data: {} });
    }
});
exports.default = DeleteProduct;
