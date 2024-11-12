"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPublishableProduct = void 0;
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
