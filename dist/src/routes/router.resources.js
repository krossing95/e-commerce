"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resources_regions_1 = __importDefault(require("../controllers/resources/resources.regions"));
const resourcesRouter = express_1.default.Router();
resourcesRouter.get("/regions", resources_regions_1.default);
exports.default = resourcesRouter;
