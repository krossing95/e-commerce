"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProductUpdationValidator = void 0;
const static_index_1 = require("../../lib/static/static.index");
const method_string_1 = require("../../helpers/methods/method.string");
const enum_index_1 = require("../../lib/enum/enum.index");
const useProductUpdationValidator = (data, next) => {
    var _a;
    const { product_id, //required
    category_id, // required
    product_name, // required
    subcategory_id, quantity, discount, price, district, region, product_images, featured_image, is_negotiable, publishing_status, } = data;
    if (!static_index_1.Regex.MONGOOBJECT.test(category_id) ||
        !static_index_1.Regex.MONGOOBJECT.test(product_id))
        return { error: "Incorrect category provided" };
    const refinedProductName = (0, method_string_1.cleanExcessWhiteSpaces)(product_name);
    if (refinedProductName.length === 0)
        return { error: "Product name is required" };
    if (refinedProductName.includes("<script>"))
        return { error: "Product name is rejected" };
    if (typeof publishing_status === "string") {
        if (publishing_status.length === 0)
            return { error: "Publishing status is missing request" };
        if (![
            enum_index_1.ProductPublishingStatusEnum.DRAFTED,
            enum_index_1.ProductPublishingStatusEnum.PUBLISHED,
        ].includes(publishing_status))
            return { error: "Publishing status is not accepted" };
    }
    if (typeof subcategory_id === "string") {
        if (!static_index_1.Regex.MONGOOBJECT.test(subcategory_id))
            return { error: "Incorrect subcategory provided" };
    }
    if (typeof quantity === "number") {
        if (quantity === 0)
            return { error: "Product quantity cannot be 0" };
    }
    if (typeof discount === "number") {
        if (discount === 0)
            return { error: "Discount cannot be 0" };
        if (discount > 100)
            return { error: "Discount is a value ranging between 0 & 100" };
    }
    if (typeof price === "number") {
        if (price === 0)
            return { error: "Product price cannot be 0" };
    }
    if (typeof is_negotiable === "boolean") {
        if (![true, false].includes(is_negotiable))
            return { error: "Incorrect data provided" };
    }
    if (typeof region === "string") {
        if (typeof district !== "string")
            return { error: "Provide a district in the selected region" };
        const regions = static_index_1.Regions.map((reg) => reg.region);
        if (!regions.includes(region))
            return { error: "Provided region does not exists" };
        const regionData = (_a = static_index_1.Regions.filter((reg) => reg.region === region)) === null || _a === void 0 ? void 0 : _a[0];
        const districts = regionData.districts.map((district) => district);
        if (!districts.includes(district))
            return { error: "Provided district does not exist in the chosen region" };
    }
    if (typeof featured_image === "string") {
        const featuredImageParts = featured_image.split(",", 2);
        if (featuredImageParts.length === 2) {
            const featuredImageExtension = featuredImageParts[0];
            const imageData = featuredImageParts[1];
            if (!static_index_1.Regex.ISBASE64.test(imageData))
                return { error: "Invalid featured image detected" };
            if (featuredImageExtension !== "data:image/png;base64" &&
                featuredImageExtension !== "data:image/jpeg;base64" &&
                featuredImageExtension !== "data:image/jpg;base64" &&
                featuredImageExtension !== "data:image/webp;base64")
                return {
                    error: "Choose jpeg, jpg, png, webp files only.",
                };
        }
    }
    if (product_images) {
        if (product_images.length > 0) {
            let imageHasError = false;
            for (let i = 0; i < product_images.length; i++) {
                const productImage = product_images[i];
                const productImageParts = productImage.split(",", 2);
                if (productImageParts.length !== 2)
                    imageHasError = true;
                if (productImageParts.length === 2) {
                    const featuredImageExtension = productImageParts[0];
                    const imageData = productImageParts[1];
                    if (!static_index_1.Regex.ISBASE64.test(imageData))
                        imageHasError = true;
                    if (featuredImageExtension !== "data:image/png;base64" &&
                        featuredImageExtension !== "data:image/jpeg;base64" &&
                        featuredImageExtension !== "data:image/jpg;base64" &&
                        featuredImageExtension !== "data:image/webp;base64")
                        imageHasError = true;
                }
            }
            if (imageHasError)
                return { error: "One or more product image(s) is/are invalid" };
        }
    }
    next();
};
exports.useProductUpdationValidator = useProductUpdationValidator;
