"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountCalculation = exports.isPublishableProduct = void 0;
const isPublishableProduct = (product) => {
    let publish = true;
    if (!product.quantity ||
        !product.featuredImage ||
        !product.description ||
        !product.price ||
        !product.region ||
        !product.district) {
        publish = false;
    }
    return publish;
};
exports.isPublishableProduct = isPublishableProduct;
const discountCalculation = ({ price, discount, }) => {
    const discountedPrice = !price
        ? null
        : !discount
            ? null
            : Number(Number(price - price * (discount / 100)).toFixed(2));
    return discountedPrice;
};
exports.discountCalculation = discountCalculation;
