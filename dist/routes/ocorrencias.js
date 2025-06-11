"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const ocorrencia_controller_1 = require("@/controllers/ocorrencia.controller");
const upload_1 = require("../config/upload");
const router = (0, express_1.Router)();
const controller = new ocorrencia_controller_1.OcorrenciaController();
router.use(auth_middleware_1.authenticateToken);
// Listagem e busca
router.get('/', controller.list);
router.get('/:id', controller.findById);
// Criação e atualização
router.post('/', (0, auth_middleware_1.requirePermission)('create:ocorrencia'), controller.create);
router.put('/:id', (0, auth_middleware_1.requirePermission)('update:ocorrencia'), controller.update);
router.delete('/:id', (0, auth_middleware_1.requirePermission)('delete:ocorrencia'), controller.delete);
// Rotas específicas
router.get('/status/:status', controller.findByStatus);
router.get('/placa/:placa', controller.findByPlaca);
// Upload de fotos
router.post('/:id/fotos', (0, auth_middleware_1.requirePermission)('upload:foto'), upload_1.upload.array('fotos'), controller.addFotos);
exports.default = router;
