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
Object.defineProperty(exports, "__esModule", { value: true });
const config_cloudinary_1 = require("../../configs/cloudinary/config.cloudinary");
const destroyImage = (photo_id) => __awaiter(void 0, void 0, void 0, function* () {
    const uploader = yield (0, config_cloudinary_1.cloudinaryconfig)();
    let photoIdInstance = !photo_id ? "" : photo_id;
    photoIdInstance.length > 0
        ? yield uploader.uploader
            .destroy(photoIdInstance)
            .catch((err) => console.warn(err))
        : null;
    return photoIdInstance;
});
exports.default = destroyImage;
