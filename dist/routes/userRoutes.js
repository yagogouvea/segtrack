"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController = __importStar(require("../controllers/userController"));
const router = (0, express_1.Router)();
// Listar todos os usuários (requer permissão de leitura de usuários)
router.get('/', authMiddleware_1.authenticateToken, (req, res, next) => {
    // Se for admin, permite acesso
    if (req.user?.role === 'admin') {
        return next();
    }
    // Caso contrário, verifica permissão específica
    (0, authMiddleware_1.requirePermission)('users:read')(req, res, next);
}, userController.getUsers);
// Obter usuário específico
router.get('/:id', authMiddleware_1.authenticateToken, (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    (0, authMiddleware_1.requirePermission)('users:read')(req, res, next);
}, userController.getUser);
// Criar novo usuário
router.post('/', authMiddleware_1.authenticateToken, (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    (0, authMiddleware_1.requirePermission)('users:create')(req, res, next);
}, userController.createUser);
// Atualizar usuário
router.put('/:id', authMiddleware_1.authenticateToken, (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    (0, authMiddleware_1.requirePermission)('users:update')(req, res, next);
}, userController.updateUser);
// Excluir usuário (requer permissão de exclusão de usuários)
router.delete('/:id', authMiddleware_1.authenticateToken, (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    (0, authMiddleware_1.requirePermission)('users:delete')(req, res, next);
}, userController.deleteUser);
exports.default = router;
