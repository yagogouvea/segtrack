"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../infrastructure/middleware/auth.middleware");
const foto_controller_1 = require("../../../controllers/foto.controller");
const multer_1 = __importDefault(require("multer"));
const upload_config_1 = require("../../../config/upload.config");
const router = (0, express_1.Router)();
const controller = new foto_controller_1.FotoController();
const upload = (0, multer_1.default)(upload_config_1.uploadConfig);
router.use(auth_middleware_1.authenticateToken);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', upload.single('foto'), controller.upload);
router.delete('/:id', controller.delete);
exports.default = router;
//# sourceMappingURL=fotos.routes.js.map