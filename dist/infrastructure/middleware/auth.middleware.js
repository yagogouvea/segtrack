"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.authenticateCliente = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../../utils/response");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Token de acesso necessário' });
        return;
    }
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET não está definido no ambiente');
        res.status(500).json({ message: 'Erro de configuração do servidor' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Garantir que o id seja mapeado do sub para compatibilidade
        if (decoded.sub && !decoded.id) {
            decoded.id = decoded.sub;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(403).json({ message: 'Token inválido' });
    }
};
exports.authenticateToken = authenticateToken;
// Middleware específico para autenticação de clientes
const authenticateCliente = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Token de acesso necessário' });
        return;
    }
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET não está definido no ambiente');
        res.status(500).json({ message: 'Erro de configuração do servidor' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Garantir que o id seja mapeado do sub para compatibilidade
        if (decoded.sub && !decoded.id) {
            decoded.id = decoded.sub;
        }
        // Verificar se é um token de cliente
        if (decoded.tipo !== 'cliente') {
            res.status(403).json({ message: 'Acesso negado. Token de cliente necessário.' });
            return;
        }
        req.cliente = decoded;
        next();
    }
    catch (error) {
        console.error('Erro na verificação do token de cliente:', error);
        res.status(403).json({ message: 'Token inválido' });
    }
};
exports.authenticateCliente = authenticateCliente;
const requirePermission = (permission) => {
    return (req, res, next) => {
        console.log('[requirePermission] Verificando permissão:', permission);
        console.log('[requirePermission] Usuário:', req.user);
        console.log('[requirePermission] URL:', req.url);
        console.log('[requirePermission] Method:', req.method);
        if (!req.user) {
            console.log('[requirePermission] Usuário não autenticado');
            response_1.sendResponse.unauthorized(res, 'Usuário não autenticado');
            return;
        }
        // Admin tem todas as permissões
        if (req.user.role === 'admin') {
            console.log('[requirePermission] Usuário é admin, permitindo acesso');
            next();
            return;
        }
        const perms = Array.isArray(req.user.permissions)
            ? req.user.permissions
            : typeof req.user.permissions === 'string'
                ? JSON.parse(req.user.permissions)
                : [];
        // LOG DETALHADO DO ARRAY DE PERMISSÕES
        console.log('[requirePermission] Permissões do usuário (array):', perms);
        console.log('[requirePermission] Permissão necessária:', permission);
        if (!perms.includes(permission)) {
            console.log('[requirePermission] Acesso negado - permissão não encontrada');
            response_1.sendResponse.forbidden(res, 'Acesso negado');
            return;
        }
        console.log('[requirePermission] Permissão concedida');
        next();
    };
};
exports.requirePermission = requirePermission;
