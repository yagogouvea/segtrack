"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const env_1 = require("@/config/env");
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: err.errors,
        });
    }
    console.error(err);
    return res.status(500).json({
        status: 'error',
        message: env_1.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
}
