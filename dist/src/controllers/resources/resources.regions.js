"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_index_1 = require("../../lib/static/static.index");
const FetchRegions = (req, res) => {
    var _a;
    const q = (_a = req.query) === null || _a === void 0 ? void 0 : _a.q;
    let regionsData = static_index_1.Regions;
    if (q) {
        const keyword = q.toLowerCase();
        regionsData = regionsData.filter((data) => JSON.stringify(data).toLowerCase().includes(keyword));
    }
    return res
        .status(200)
        .json({ message: "", code: "200", data: { regions: regionsData } });
};
exports.default = FetchRegions;
