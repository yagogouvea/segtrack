"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Rota protegida que requer permissão específica
router.get('/admin', (0, auth_middleware_1.requirePermission)('read:dashboard'), async (_req, res) => {
    res.json({ message: 'Acesso permitido - Área administrativa' });
});
// Rota protegida que requer outra permissão
router.get('/manager', (0, auth_middleware_1.requirePermission)('read:relatorio'), async (_req, res) => {
    res.json({ message: 'Acesso permitido - Área gerencial' });
});
exports.default = router;
//# sourceMappingURL=protectedRoutes.js.map