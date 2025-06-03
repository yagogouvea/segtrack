"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_HEADERS = exports.ALLOWED_METHODS = exports.ALLOWED_ORIGINS = void 0;
exports.corsMiddleware = corsMiddleware;
exports.ALLOWED_ORIGINS = [
    'https://segtrack-frontend-2mhd.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];
exports.ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
exports.ALLOWED_HEADERS = [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
];
function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    // Log da requisição para debug
    console.log(`🌐 [CORS] ${req.method} ${req.path} - Origin: ${origin || 'No origin'}`);
    // Sempre incluir headers básicos de CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
    // Verificar se a origem é permitida
    if (origin && (exports.ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else if (!origin) {
        // Para requisições sem origem (ex: Postman, curl)
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    else {
        console.warn(`❌ [CORS] Origem bloqueada: ${origin}`);
        return res.status(403).json({
            error: 'CORS Error',
            message: `Origin '${origin}' não permitida`,
            allowedOrigins: exports.ALLOWED_ORIGINS
        });
    }
    // Tratamento especial para requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', exports.ALLOWED_METHODS.join(', '));
        res.setHeader('Access-Control-Allow-Headers', exports.ALLOWED_HEADERS.join(', '));
        console.log('✅ [CORS] Respondendo preflight OPTIONS');
        return res.status(204).end();
    }
    next();
}
