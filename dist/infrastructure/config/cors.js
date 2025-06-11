"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://painelsegtrack.com.br',
    'https://painelsegtrack.com.br',
    'http://api.painelsegtrack.com.br',
    'https://api.painelsegtrack.com.br'
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Origem não permitida pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 horas
};
exports.default = corsOptions;
