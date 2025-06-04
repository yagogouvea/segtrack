"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Exemplo de rota protegida que requer autenticação
router.get('/profile', (req, res) => {
    // O usuário já está autenticado neste ponto
    res.json({
        message: 'Perfil do usuário',
        user: req.user
    });
});
// Exemplo de rota que requer permissão específica
router.post('/admin-action', (0, authMiddleware_1.requirePermission)('ADMIN'), (req, res) => {
    res.json({
        message: 'Ação administrativa realizada com sucesso',
        user: req.user
    });
});
exports.default = router;
