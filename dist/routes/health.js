"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/health', async (req, res) => {
    try {
        // Test database connection
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        return res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
