"use strict";
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();
// Simulação de banco de dados (substitua pelo seu modelo real)
const db = {
    Prestadores: {
        async findOne({ email }) {
            // Exemplo: prestador hardcoded
            if (email === 'prestador@exemplo.com') {
                return {
                    id: 1,
                    email: 'prestador@exemplo.com',
                    nome: 'Prestador Exemplo',
                    senhaHash: await bcrypt.hash('senha123', 10), // senha: senha123
                };
            }
            return null;
        }
    }
};
router.post('/login', async (req, res) => {
    console.log('🔍 [prestador/login] Requisição de login recebida');
    console.log('📱 [prestador/login] User-Agent:', req.headers['user-agent']);
    console.log('🌐 [prestador/login] Origin:', req.headers['origin']);
    console.log('📊 [prestador/login] Headers:', req.headers);
    console.log('📝 [prestador/login] Body:', req.body);
    const { email, senha } = req.body;
    if (!email || !senha) {
        console.log('❌ [prestador/login] Email ou senha não fornecidos');
        return res.status(400).json({ erro: "Email e senha são obrigatórios." });
    }
    console.log('🔍 [prestador/login] Buscando usuário no banco...');
    try {
        // Corrigido: caminho correto para o prisma
        const db = await require('../lib/prisma').ensurePrisma();
        if (!db) {
            console.error('❌ [prestador/login] Erro: Instância do Prisma não disponível');
            return res.status(500).json({ erro: "Erro de conexão com o banco de dados." });
        }
        const usuario = await db.usuarioPrestador.findFirst({
            where: { email, ativo: true }
        });
        console.log('👤 [prestador/login] Usuário encontrado:', usuario ? 'Sim' : 'Não');
        if (!usuario) {
            console.log('❌ [prestador/login] Usuário não encontrado ou inativo');
            return res.status(401).json({ erro: "Usuário não encontrado ou inativo." });
        }
        console.log('🔑 [prestador/login] Verificando senha...');
        const senhaValida = await require('bcrypt').compare(senha, usuario.senha_hash);
        console.log('✅ [prestador/login] Senha válida:', senhaValida);
        if (!senhaValida) {
            console.log('❌ [prestador/login] Senha inválida');
            return res.status(401).json({ erro: "Senha inválida." });
        }
        console.log('👤 [prestador/login] Buscando prestador...');
        const prestador = await db.prestador.findUnique({ where: { id: usuario.prestador_id } });
        if (!prestador) {
            console.log('❌ [prestador/login] Prestador não encontrado');
            return res.status(404).json({ erro: "Prestador não encontrado." });
        }
        console.log('🎫 [prestador/login] Gerando token JWT...');
        const token = require('jsonwebtoken').sign({
            id: usuario.id,
            email: usuario.email,
            nome: prestador === null || prestador === void 0 ? void 0 : prestador.nome,
            tipo: 'prestador'
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '12h' });
        console.log('✅ [prestador/login] Login bem-sucedido');
        console.log('👤 [prestador/login] Usuário:', usuario.email);
        console.log('👤 [prestador/login] Prestador:', prestador.nome);
        res.json({
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nome: prestador === null || prestador === void 0 ? void 0 : prestador.nome
            }
        });
    }
    catch (error) {
        console.error('❌ [prestador/login] Erro no login:', error);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});
module.exports = router;
