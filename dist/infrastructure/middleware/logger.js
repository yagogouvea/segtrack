"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
function requestLogger(req, res, next) {
    const start = Date.now();
    const sanitizedUrl = req.url.replace(/[<>]/g, '');
    const sanitizedMethod = req.method.replace(/[<>]/g, '');
    console.log(`[${new Date().toISOString()}] 📥 Recebendo ${sanitizedMethod} ${sanitizedUrl}`, {
        ip: req.ip,
        realIp: req.get('x-real-ip'),
        forwardedFor: req.get('x-forwarded-for'),
        userAgent: req.get('user-agent')
    });
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusEmoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
        console.log(`[${new Date().toISOString()}] ${statusEmoji} ${sanitizedMethod} ${sanitizedUrl}`, {
            status,
            duration: `${duration}ms`,
            ip: req.ip,
            realIp: req.get('x-real-ip')
        });
    });
    next();
}
