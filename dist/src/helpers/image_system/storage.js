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
const imageStorage = (_a) => __awaiter(void 0, [_a], void 0, function* ({ lastId, photo_data, folder, }) {
    const uploader = yield (0, config_cloudinary_1.cloudinaryconfig)();
    let photoIdInstance = !lastId ? "" : lastId;
    let photo_id;
    let secure_url;
    photoIdInstance.length > 0
        ? yield uploader.uploader
            .destroy(photoIdInstance)
            .catch((err) => console.warn(err))
        : null;
    yield uploader.uploader.upload(photo_data, { folder: `${folder}` }, (err, done) => {
        photo_id = done === null || done === void 0 ? void 0 : done.public_id;
        secure_url = done === null || done === void 0 ? void 0 : done.secure_url;
    });
    return { photo_id, secure_url };
});
exports.default = imageStorage;
