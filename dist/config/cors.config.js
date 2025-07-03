"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins = [
    'https://app.painelsegtrack.com.br',
    'http://localhost:5173'
];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400 // 24 horas
};
exports.default = corsOptions;
