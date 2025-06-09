"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.hashToken = hashToken;
exports.verifyToken = verifyToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Gera um hash seguro para a senha usando bcrypt
 * @param password A senha em texto plano
 * @returns O hash da senha
 */
async function hashPassword(password) {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(password, salt);
}
/**
 * Verifica se uma senha em texto plano corresponde a um hash
 * @param password A senha em texto plano
 * @param hash O hash da senha
 * @returns true se a senha corresponde ao hash, false caso contrário
 */
async function verifyPassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
/**
 * Gera um hash seguro para um token
 * @param token O token em texto plano
 * @returns O hash do token
 */
async function hashToken(token) {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(token, salt);
}
/**
 * Verifica se um token em texto plano corresponde a um hash
 * @param token O token em texto plano
 * @param hash O hash do token
 * @returns true se o token corresponde ao hash, false caso contrário
 */
async function verifyToken(token, hash) {
    return bcryptjs_1.default.compare(token, hash);
}
