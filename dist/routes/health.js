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
        console.error('Erro ao conectar com o banco:', error);
        // Retorna 200 mesmo com erro de banco para não quebrar o frontend
        return res.status(200).json({
            message: 'API SEGTRACK funcionando (banco offline)',
            database: 'offline',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
});
exports.default = router;
