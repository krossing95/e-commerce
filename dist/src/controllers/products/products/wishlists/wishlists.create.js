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
const helper_request_1 = require("../../../../helpers/request/helper.request");
const static_index_1 = require("../../../../lib/static/static.index");
const middleware_jwt_data_1 = __importDefault(require("../../../../middlewares/middleware.jwt-data"));
const model_product_1 = __importDefault(require("../../../../models/model.product"));
const enum_index_1 = require("../../../../lib/enum/enum.index");
const model_wishlist_1 = __importDefault(require("../../../../models/model.wishlist"));
const wishlists_product_1 = require("./wishlists.product");
const CreateWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = ["product_id"];
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
    const productId = requestBody.product_id;
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
        // retrieve existing wishlist instance on the product and customer
        const [productData, exitingWishListItem] = yield Promise.all([
            model_product_1.default.findById(productId),
            model_wishlist_1.default.findOne({
                customerId: tokenDataObject._id,
                productId,
            }),
        ]);
        if (!productData)
            return res
                .status(404)
                .json({ message: "Product not found", code: "404", data: {} });
        if (productData.isDeleted ||
            productData.publishingStatus === enum_index_1.ProductPublishingStatusEnum.DRAFTED)
            return res.status(403).json({
                message: "Cannot add the product to wishlist",
                code: "403",
                data: {},
            });
        if (exitingWishListItem) {
            yield exitingWishListItem.deleteOne();
            const productInformation = yield (0, wishlists_product_1.fetchProductAfterWishlistCreation)(productData);
            return res.status(200).json({
                message: "Product removed from wishlist",
                code: "200",
                data: { product: productInformation },
            });
        }
        // create new wishlist instance on the product and user
        const newWishlistData = new model_wishlist_1.default({
            customerId: tokenDataObject._id,
            productId,
        });
        yield newWishlistData.save();
        const productInformation = yield (0, wishlists_product_1.fetchProductAfterWishlistCreation)(productData);
        return res.status(200).json({
            message: "Product added to wishlist",
            code: "200",
            data: { product: productInformation },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Whoops! Something went wrong", code: "500", data: {} });
    }
});
exports.default = CreateWishlist;
