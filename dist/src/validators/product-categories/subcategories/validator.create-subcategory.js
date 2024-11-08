"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProductSubcategoryCreationValidator = void 0;
const method_string_1 = require("../../../helpers/methods/method.string");
const static_index_1 = require("../../../lib/static/static.index");
const useProductSubcategoryCreationValidator = (data, next) => {
    const { categoryId, subcategory } = data;
    const refinedSubCategory = (0, method_string_1.cleanExcessWhiteSpaces)(subcategory);
    if (refinedSubCategory.length === 0)
        return { error: "Subcategory is required" };
    if (refinedSubCategory.includes("<script>"))
        return { error: "Subcategory is required" };
    if (!static_index_1.Regex.MONGOOBJECT.test(categoryId))
        return { error: "Incorrect main category data" };
    next();
};
exports.useProductSubcategoryCreationValidator = useProductSubcategoryCreationValidator;
