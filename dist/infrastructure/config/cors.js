"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsOptions = {
    origin: (origin, callback) => {
        console.log('🔍 CORS - Origin recebida:', origin);
        console.log('🔍 CORS - NODE_ENV:', process.env.NODE_ENV);
        // Temporariamente permitir todas as origens para debug
        console.log('✅ CORS - Permitindo todas as origens temporariamente');
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 horas
};
exports.default = corsOptions;
