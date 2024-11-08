"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProductSubcategoryUpdationValidator = void 0;
const method_string_1 = require("../../../helpers/methods/method.string");
const static_index_1 = require("../../../lib/static/static.index");
const useProductSubcategoryUpdationValidator = (data, next) => {
    const { category_id, subcategory_id, subcategory, is_active } = data;
    const refinedSubCategory = (0, method_string_1.cleanExcessWhiteSpaces)(subcategory);
    if (refinedSubCategory.length === 0)
        return { error: "Subcategory is required" };
    if (refinedSubCategory.includes("<script>"))
        return { error: "Subcategory is required" };
    if (!static_index_1.Regex.MONGOOBJECT.test(category_id))
        return { error: "Incorrect main category ID data" };
    if (!static_index_1.Regex.MONGOOBJECT.test(subcategory_id))
        return { error: "Incorrect subcategory ID data" };
    if (![true, false].includes(is_active))
        return { error: "Incorrect data @'is_active' Boolean expected" };
    next();
};
exports.useProductSubcategoryUpdationValidator = useProductSubcategoryUpdationValidator;
