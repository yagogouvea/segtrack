"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exemploListarUsuarios = exemploListarUsuarios;
exports.exemploCriarUsuario = exemploCriarUsuario;
exports.exemploTransacao = exemploTransacao;
exports.exemploQueryRaw = exemploQueryRaw;
const prisma_1 = require("@/lib/prisma");
const logger_1 = __importDefault(require("@/infrastructure/logger"));
/**
 * Este arquivo serve como exemplo de como usar o prisma de forma segura
 * após a atualização que adiciona verificação de null.
 *
 * Principais mudanças:
 * 1. Usar ensurePrisma() ao invés de acessar prisma diretamente
 * 2. Usar o logger ao invés de console.log/error
 * 3. Tratar erros adequadamente
 * 4. Usar os tipos corretos do Prisma
 */
async function exemploListarUsuarios() {
    try {
        // Obter uma instância garantida do prisma
        const db = (0, prisma_1.ensurePrisma)();
        // Usar normalmente
        const users = await db.user.findMany({
            select: {
                id: true,
                email: true,
                name: true
            }
        });
        return users;
    }
    catch (error) {
        logger_1.default.error('Erro ao listar usuários:', error);
        throw error;
    }
}
async function exemploCriarUsuario(data) {
    try {
        const db = (0, prisma_1.ensurePrisma)();
        const userData = {
            email: data.email,
            name: data.name,
            passwordHash: data.passwordHash,
            role: 'operator',
            permissions: '[]',
            active: true
        };
        const user = await db.user.create({
            data: userData
        });
        return user;
    }
    catch (error) {
        // Exemplo de tratamento específico de erro
        if (error.code === 'P2002') {
            logger_1.default.warn('Tentativa de criar usuário com email duplicado:', data.email);
            throw new Error('Email já está em uso');
        }
        logger_1.default.error('Erro ao criar usuário:', error);
        throw error;
    }
}
async function exemploTransacao() {
    try {
        const db = (0, prisma_1.ensurePrisma)();
        // Exemplo de transação
        const result = await db.$transaction(async (tx) => {
            const userData = {
                email: 'teste@exemplo.com',
                name: 'Teste',
                passwordHash: 'senha_hash_123',
                role: 'operator',
                permissions: '[]',
                active: true
            };
            const user = await tx.user.create({
                data: userData
            });
            // Criar um registro relacionado
            const ocorrenciaData = {
                placa1: 'ABC1234',
                cliente: 'Cliente Teste',
                tipo: 'TESTE',
                status: 'em_andamento',
                criado_em: new Date(),
                atualizado_em: new Date()
            };
            const ocorrencia = await tx.ocorrencia.create({
                data: ocorrenciaData
            });
            return { user, ocorrencia };
        });
        return result;
    }
    catch (error) {
        logger_1.default.error('Erro na transação:', error);
        throw error;
    }
}
async function exemploQueryRaw() {
    try {
        const db = (0, prisma_1.ensurePrisma)();
        // Exemplo de query raw com tipos
        const result = await db.$queryRaw `
      SELECT 
        u.id,
        u.name,
        COUNT(o.id) as total_ocorrencias
      FROM User u
      LEFT JOIN Ocorrencia o ON o.placa1 = u.id
      GROUP BY u.id, u.name
    `;
        return result;
    }
    catch (error) {
        logger_1.default.error('Erro na query raw:', error);
        throw error;
    }
}
