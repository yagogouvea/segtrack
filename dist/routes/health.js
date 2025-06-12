"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        await (0, prisma_1.testConnection)();
        res.status(200).json({ status: 'healthy' });
    }
    catch (error) {
        console.error('Erro no healthcheck:', error);
        res.status(500).json({ status: 'unhealthy', error: String(error) });
    }
});
exports.default = router;
