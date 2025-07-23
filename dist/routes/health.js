"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/health', async (req, res) => {
    try {
        await (0, prisma_1.testConnection)();
        return res.status(200).json({ message: 'API SEGTRACK funcionando corretamente!' });
    }
    catch (error) {
        console.error('Erro ao verificar saúde do sistema:', error);
        res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
    }
});
exports.default = router;
