"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.checkPermissions = checkPermissions;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ✅ Exporta como função nomeada
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
}
// ✅ Exporta como função nomeada
function checkPermissions(requiredPermissions) {
    return (req, res, next) => {
        const userPerms = req.user?.permissions || [];
        const isAdmin = req.user?.role === 'admin';
        const hasPermission = requiredPermissions.some((perm) => userPerms.includes(perm));
        if (isAdmin || hasPermission) {
            return next();
        }
        return res.status(403).json({ message: 'Permissão negada' });
    };
}
