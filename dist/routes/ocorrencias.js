"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const ocorrencia_controller_1 = require("../controllers/ocorrencia.controller");
const ocorrencia_validator_1 = require("../api/v1/validators/ocorrencia.validator");
const upload_1 = require("../config/upload");
const router = (0, express_1.Router)();
const controller = new ocorrencia_controller_1.OcorrenciaController();
// Rota de teste sem autenticação
router.get('/test', (req, res) => {
    console.log('[ocorrencias] Rota de teste acessada');
    res.json({ message: 'Rota de teste funcionando!' });
});
router.use(auth_middleware_1.authenticateToken);
// Rota de teste com autenticação
router.get('/test-auth', (req, res) => {
    console.log('[ocorrencias] Rota de teste com auth acessada');
    res.json({ message: 'Rota de teste com auth funcionando!', user: req.user });
});
// Listagem e busca
router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
// Criação e atualização
router.post('/', (0, auth_middleware_1.requirePermission)('create:ocorrencia'), ocorrencia_validator_1.validateCreateOcorrencia, (req, res) => controller.create(req, res));
router.put('/:id', (0, auth_middleware_1.requirePermission)('update:ocorrencia'), (req, res) => controller.update(req, res));
router.delete('/:id', (0, auth_middleware_1.requirePermission)('delete:ocorrencia'), (req, res) => controller.delete(req, res));
// Rotas específicas
router.get('/status/:status', (req, res) => controller.findByStatus(req, res));
router.get('/placa/:placa', (req, res) => controller.findByPlaca(req, res));
// Rota para buscar resultado de uma ocorrência
router.get('/:id/resultado', (req, res) => controller.findResultado(req, res));
// Upload de fotos
router.post('/:id/fotos', (0, auth_middleware_1.requirePermission)('upload:foto'), upload_1.upload.array('fotos'), (req, res) => controller.addFotos(req, res));
exports.default = router;
