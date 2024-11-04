"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSetup = exports.pageDensity = void 0;
exports.pageDensity = Number(process.env.ECOM_PAGE_DENSITY);
const paginationSetup = ({ page, page_density = exports.pageDensity, }) => {
    const skip = (page - 1) * page_density;
    return { page, limit: page_density, skip };
};
exports.paginationSetup = paginationSetup;
