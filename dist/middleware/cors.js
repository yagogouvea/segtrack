"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_HEADERS = exports.ALLOWED_METHODS = exports.ALLOWED_ORIGINS = void 0;
exports.corsMiddleware = corsMiddleware;
// Lista de origens permitidas
exports.ALLOWED_ORIGINS = [
    'https://segtrack-frontend-2mhd.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);
// Métodos HTTP permitidos
exports.ALLOWED_METHODS = [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS'
];
// Headers permitidos
exports.ALLOWED_HEADERS = [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
];
// Rate limiting por origem
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 100;
function corsMiddleware(req, res, next) {
    const origin = req.headers.origin || '';
    const ip = req.ip || '';
    // Rate limiting
    const now = Date.now();
    const requestData = requestCounts.get(ip) || { count: 0, timestamp: now };
    if (now - requestData.timestamp > RATE_LIMIT_WINDOW) {
        requestCounts.set(ip, { count: 1, timestamp: now });
    }
    else {
        requestData.count++;
        if (requestData.count > MAX_REQUESTS_PER_WINDOW) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Por favor, aguarde um momento antes de fazer mais requisições.'
            });
        }
        requestCounts.set(ip, requestData);
    }
    // Verificação de origem
    if (!origin) {
        return res.status(403).json({
            error: 'CORS Error',
            message: 'Origem não fornecida'
        });
    }
    // Verificar se a origem é permitida
    if (!exports.ALLOWED_ORIGINS.includes(origin) && !origin.endsWith('.vercel.app')) {
        console.warn(`❌ [CORS] Origem bloqueada: ${origin}`);
        return res.status(403).json({
            error: 'CORS Error',
            message: 'Origem não permitida'
        });
    }
    // Configurar headers CORS
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', exports.ALLOWED_METHODS.join(', '));
    res.setHeader('Access-Control-Allow-Headers', exports.ALLOWED_HEADERS.join(', '));
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '3600');
    // Headers de segurança adicionais
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Tratamento de preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
}
