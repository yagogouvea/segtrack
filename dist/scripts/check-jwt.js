"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function checkJWT() {
    console.log('Verificando JWT_SECRET...');
    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET não está configurado!');
        return;
    }
    try {
        const testToken = jsonwebtoken_1.default.sign({ test: true }, process.env.JWT_SECRET, { expiresIn: '1m' });
        const decoded = jsonwebtoken_1.default.verify(testToken, process.env.JWT_SECRET);
        console.log('✅ JWT_SECRET está configurado e funcionando!');
        console.log('Token de teste decodificado:', decoded);
    }
    catch (error) {
        console.error('❌ Erro ao verificar JWT:', error);
        process.exit(1);
    }
}
checkJWT();
