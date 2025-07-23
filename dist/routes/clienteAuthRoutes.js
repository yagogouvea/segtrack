"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clienteAuthController_1 = require("../controllers/clienteAuthController");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Rotas para autenticação de clientes usando a nova tabela ClienteAuth
router.post('/login', clienteAuthController_1.loginCliente);
router.post('/cadastro', clienteAuthController_1.cadastrarClienteComAuth);
// Rota protegida para alterar senha (requer autenticação de cliente)
router.put('/alterar-senha', auth_middleware_1.authenticateCliente, clienteAuthController_1.alterarSenhaCliente);
exports.default = router;
