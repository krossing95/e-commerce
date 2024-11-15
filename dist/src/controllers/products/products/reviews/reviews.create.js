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
const validate_create_review_1 = require("../../../../validators/products/reviews/validate.create-review");
const middleware_jwt_data_1 = __importDefault(require("../../../../middlewares/middleware.jwt-data"));
const model_product_1 = __importDefault(require("../../../../models/model.product"));
const model_product_review_1 = __importDefault(require("../../../../models/model.product-review"));
const reviews_product_1 = require("./reviews.product");
const CreateProductReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expected_payload = ["product_id", "rate", "review"];
    const checkPayload = (0, helper_request_1.isTrueBodyStructure)(req.body, expected_payload);
    if (!checkPayload)
        return res
            .status(400)
            .json({ message: "Bad request", code: "400", data: {} });
    // retrieve the request body
    const requestBody = req.body;
    const validate = (0, validate_create_review_1.useProductReviewCreationPayload)(requestBody, () => __awaiter(void 0, void 0, void 0, function* () {
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
            // check if the customer already rated or reviewed the product
            const [productData, customersReview] = yield Promise.all([
                model_product_1.default.findById(requestBody.product_id),
                model_product_review_1.default.findOne({
                    productId: requestBody.product_id,
                    customerId: tokenDataObject._id,
                }),
            ]);
            if (!productData)
                return res
                    .status(404)
                    .json({ message: "Product not found", code: "404", data: {} });
            if (customersReview) {
                customersReview.rate = requestBody.rate;
                customersReview.review = requestBody.review;
                customersReview.isEdited = true;
                yield customersReview.save();
                //  fetch the product and populate with new reviews and rating
                const productWithRates = yield (0, reviews_product_1.fetchProductWithStarRates)(requestBody.product_id);
                if (!productWithRates)
                    return res
                        .status(404)
                        .json({ message: "Could not retrieve data", code: "404", data: {} });
                return res.status(200).json({
                    message: "Product reviewed or rated successfully",
                    code: "200",
                    data: { product: productWithRates },
                });
            }
            // create new instance of the product review model
            const newProductReview = new model_product_review_1.default({
                productId: requestBody.product_id,
                customerId: tokenDataObject._id,
                rate: requestBody.rate,
                review: requestBody.review,
            });
            yield newProductReview.save();
            //  fetch the product and populate with new reviews and rating
            const productWithRates = yield (0, reviews_product_1.fetchProductWithStarRates)(requestBody.product_id);
            if (!productWithRates)
                return res
                    .status(404)
                    .json({ message: "Could not retrieve data", code: "404", data: {} });
            return res.status(200).json({
                message: "Product reviewed or rated successfully",
                code: "200",
                data: { product: productWithRates },
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
exports.default = CreateProductReview;
