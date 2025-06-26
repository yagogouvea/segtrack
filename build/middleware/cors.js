"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = corsMiddleware;
const ALLOWED_ORIGINS = [
    'https://segtrack-frontend-2mhd.vercel.app',
    'http://localhost:5173'
];
function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    // Permitir origens específicas
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // Headers necessários para CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
    // Responder imediatamente a requisições OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
}
