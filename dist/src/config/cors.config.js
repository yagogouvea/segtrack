"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins = [
    'https://segtrack.comerceoficial.com',
    'https://www.segtrack.comerceoficial.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    '.onrender.com',
    '.amazonaws.com' // Para permitir domínios AWS
];
const corsOptions = {
    origin: (origin, callback) => {
        // Permitir requisições sem origem (como apps mobile ou requisições curl)
        if (!origin) {
            return callback(null, true);
        }
        // Verificar se a origem termina com .onrender.com ou está na lista de permitidos
        if (allowedOrigins.some(allowed => origin === allowed ||
            (allowed.startsWith('.') && origin.endsWith(allowed)) ||
            process.env.NODE_ENV === 'development')) {
            callback(null, true);
        }
        else {
            console.warn(`Origem ${origin} não permitida por CORS`);
            callback(new Error('Não permitido por CORS'));
        }
    },
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
//# sourceMappingURL=cors.config.js.map