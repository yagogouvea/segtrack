"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("../../shared/errors/AppError");
const zod_1 = require("zod");
function errorHandler(err, req, res, _next) {
    console.error('❌ Erro capturado:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        realIp: req.get('x-real-ip'),
        forwardedFor: req.get('x-forwarded-for')
    });
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            code: err.code
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            status: 'error',
            message: 'Erro de validação',
            errors: err.errors
        });
        return;
    }
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Erro interno do servidor'
    });
}
