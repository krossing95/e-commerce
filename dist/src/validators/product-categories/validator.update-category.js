"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProductCategoryUpdationValidator = void 0;
const method_string_1 = require("../../helpers/methods/method.string");
const static_index_1 = require("../../lib/static/static.index");
const useProductCategoryUpdationValidator = (data, next) => {
    const { category, category_image, category_id, is_active } = data;
    // validate the category
    const refinedCategory = (0, method_string_1.cleanExcessWhiteSpaces)(category);
    if (refinedCategory.length === 0)
        return { error: "Category is required" };
    if (refinedCategory.includes("<script>"))
        return { error: "Category is required" };
    if (category_image) {
        const imageParts = category_image.split(",", 2);
        if (imageParts.length === 2) {
            const imageExtension = imageParts[0];
            const imageData = imageParts[1];
            if (!static_index_1.Regex.ISBASE64.test(imageData))
                return { error: "Invalid category image detected" };
            if (imageExtension !== "data:image/png;base64" &&
                imageExtension !== "data:image/jpeg;base64" &&
                imageExtension !== "data:image/jpg;base64" &&
                imageExtension !== "data:image/webp;base64")
                return {
                    error: "Choose jpeg, jpg, png, webp files only.",
                };
        }
    }
    if (![true, false].includes(is_active))
        return { error: "Incorrect data @'is_active' Boolean expected" };
    if (!static_index_1.Regex.MONGOOBJECT.test(category_id))
        return { error: "Incorrect data" };
    next();
};
exports.useProductCategoryUpdationValidator = useProductCategoryUpdationValidator;
