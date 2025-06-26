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
// Listar todos os usuários (requere permissão 'view_users')
router.get('/', authMiddleware_1.verifyToken, (0, authMiddleware_1.checkPermissions)(['view_users']), userController.getUsers);
// Criar novo usuário (requere permissão 'create_user')
router.post('/', authMiddleware_1.verifyToken, (0, authMiddleware_1.checkPermissions)(['create_user']), userController.createUser);
// Atualizar usuário existente (requere permissão 'edit_user')
router.put('/:id', authMiddleware_1.verifyToken, (0, authMiddleware_1.checkPermissions)(['edit_user']), userController.updateUser);
// Excluir usuário (requere permissão 'delete_user')
router.delete('/:id', authMiddleware_1.verifyToken, (0, authMiddleware_1.checkPermissions)(['delete_user']), userController.deleteUser);
exports.default = router;
