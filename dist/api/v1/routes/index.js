"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../infrastructure/middleware/auth.middleware");
const prestador_controller_1 = require("../../../controllers/prestador.controller");
const prestadores_routes_1 = __importDefault(require("./prestadores.routes"));
const clientes_routes_1 = __importDefault(require("./clientes.routes"));
const veiculos_routes_1 = __importDefault(require("./veiculos.routes"));
const fotos_routes_1 = __importDefault(require("./fotos.routes"));
const relatorios_routes_1 = __importDefault(require("./relatorios.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const monitoramento_routes_1 = __importDefault(require("./monitoramento.routes"));
const ocorrencias_routes_1 = __importDefault(require("./ocorrencias.routes"));
const v1Router = (0, express_1.Router)();
const prestadorController = new prestador_controller_1.PrestadorController();
// Rotas públicas (sem autenticação)
v1Router.use('/prestadores', prestadores_routes_1.default); // Rotas públicas e protegidas estão no próprio router
v1Router.use('/ocorrencias', ocorrencias_routes_1.default); // Rotas públicas e protegidas estão no próprio router
// Rotas protegidas (com autenticação)
v1Router.use('/clientes', auth_middleware_1.authenticateToken, clientes_routes_1.default);
v1Router.use('/veiculos', auth_middleware_1.authenticateToken, veiculos_routes_1.default);
// v1Router.use('/fotos', authenticateToken, fotosRouter); // TEMPORARIAMENTE COMENTADO PARA TESTE
v1Router.use('/fotos', fotos_routes_1.default); // SEM AUTENTICAÇÃO TEMPORARIAMENTE
v1Router.use('/relatorios', auth_middleware_1.authenticateToken, relatorios_routes_1.default);
v1Router.use('/users', auth_middleware_1.authenticateToken, user_routes_1.default);
v1Router.use('/monitoramento', auth_middleware_1.authenticateToken, monitoramento_routes_1.default);
exports.default = v1Router;
