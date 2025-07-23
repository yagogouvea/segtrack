"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const clienteAuthRoutes_1 = __importDefault(require("./clienteAuthRoutes"));
const router = (0, express_1.Router)();
// Rotas existentes para usuários admin
router.post('/login', authController_1.login);
router.post('/seed-admin', authController_1.seedAdmin); // rota temporária para gerar admin
// Novas rotas para clientes
router.post('/cliente/login', authController_1.loginCliente);
router.post('/cliente/cadastro', authController_1.cadastrarCliente);
// Rota para login de prestadores
router.post('/prestador/login', authController_1.loginPrestador);
// Novas rotas para autenticação de clientes usando ClienteAuth
router.use('/cliente-auth', clienteAuthRoutes_1.default);
exports.default = router;
