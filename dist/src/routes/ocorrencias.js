"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const ocorrencia_controller_1 = require("../api/v1/controllers/ocorrencia.controller");
const multer_1 = __importDefault(require("multer"));
const upload_config_1 = require("../config/upload.config");
const router = (0, express_1.Router)();
const controller = new ocorrencia_controller_1.OcorrenciaController();
const upload = (0, multer_1.default)(upload_config_1.uploadConfig);
router.use(auth_middleware_1.authenticateToken);
// Listagem e busca
router.get('/', controller.list);
router.get('/:id', controller.getById);
// Criação e atualização
router.post('/', (0, auth_middleware_1.requirePermission)('create:ocorrencia'), controller.create);
router.put('/:id', (0, auth_middleware_1.requirePermission)('update:ocorrencia'), controller.update);
router.delete('/:id', (0, auth_middleware_1.requirePermission)('delete:ocorrencia'), controller.delete);
// Upload de fotos
router.post('/:id/fotos', (0, auth_middleware_1.requirePermission)('upload:foto'), upload.array('fotos'), controller.addPhotos);
exports.default = router;
//# sourceMappingURL=ocorrencias.js.map