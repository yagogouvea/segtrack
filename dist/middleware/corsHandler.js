"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = exports.corsHandler = void 0;
const cors_config_1 = require("../config/cors.config");
Object.defineProperty(exports, "corsConfig", { enumerable: true, get: function () { return cors_config_1.corsConfig; } });
// Função para gerar log estruturado
function createCorsLog(req, allowed, reason) {
    return {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        origin: req.headers.origin || 'no-origin',
        allowed,
        reason
    };
}
// Função para log colorido no console
function logCorsRequest(log) {
    const status = log.allowed ? '✅' : '❌';
    const originColor = log.allowed ? '\x1b[32m' : '\x1b[31m'; // verde ou vermelho
    console.log(`🌐 [CORS] ${status} ${log.timestamp}\n` +
        `   Method: ${log.method}\n` +
        `   Path: ${log.path}\n` +
        `   Origin: ${originColor}${log.origin}\x1b[0m\n` +
        (log.reason ? `   Reason: ${log.reason}\n` : ''));
}
const corsHandler = (req, res, next) => {
    const origin = req.headers.origin;
    // Log da requisição para debug
    console.log(`🔒 CORS Request:
  - Origin: ${origin}
  - Method: ${req.method}
  - Path: ${req.path}
  - Headers: ${JSON.stringify(req.headers)}`);
    // Se não há origem, permite a requisição (ex: Postman)
    if (!origin) {
        console.log('✅ CORS: No origin, allowing request');
        return next();
    }
    // Verifica se a origem é permitida
    const isAllowed = cors_config_1.corsConfig.isOriginAllowed(origin);
    console.log(`🔍 CORS Origin Check: ${origin} - ${isAllowed ? 'Allowed' : 'Blocked'}`);
    if (!isAllowed) {
        console.log(`❌ CORS: Blocked origin ${origin}`);
        return res.status(403).json({
            error: 'CORS Error',
            message: `Origem ${origin} não permitida`,
            allowedOrigins: cors_config_1.corsConfig.origins
        });
    }
    // Configura os headers CORS
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', cors_config_1.corsConfig.methods.join(', '));
    res.header('Access-Control-Allow-Headers', cors_config_1.corsConfig.headers.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', cors_config_1.corsConfig.maxAge.toString());
    // Log dos headers configurados
    console.log(`✅ CORS Headers Set:
  - Allow-Origin: ${origin}
  - Allow-Methods: ${cors_config_1.corsConfig.methods.join(', ')}
  - Allow-Headers: ${cors_config_1.corsConfig.headers.join(', ')}
  - Allow-Credentials: true
  - Max-Age: ${cors_config_1.corsConfig.maxAge}`);
    // Handle preflight
    if (req.method === 'OPTIONS') {
        console.log('✅ CORS: Responding to preflight request');
        return res.status(204).end();
    }
    next();
};
exports.corsHandler = corsHandler;
