"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const login = async (req, res) => {
    try {
        // Validar corpo da requisição
        const { email, password, senha } = req.body;
        const userPassword = password || senha;
        if (!email || !userPassword) {
            res.status(400).json({ message: 'Email e password são obrigatórios' });
            return;
        }
        // Validar JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET não está definido no ambiente');
            res.status(500).json({ message: 'Erro de configuração do servidor' });
            return;
        }
        console.log('Tentativa de login para:', email);
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            const user = await db.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    passwordHash: true,
                    role: true,
                    permissions: true,
                    active: true
                }
            });
            console.log('Resultado da busca do usuário:', {
                found: !!user,
                role: user === null || user === void 0 ? void 0 : user.role,
                active: user === null || user === void 0 ? void 0 : user.active
            });
            if (!user) {
                res.status(401).json({ message: 'Usuário não encontrado' });
                return;
            }
            if (!user.active) {
                res.status(403).json({ message: 'Usuário desativado. Entre em contato com o administrador.' });
                return;
            }
            const isMatch = await bcrypt_1.default.compare(userPassword, user.passwordHash);
            console.log('Resultado da verificação de senha:', { isMatch });
            if (!isMatch) {
                res.status(401).json({ message: 'Senha incorreta' });
                return;
            }
            try {
                let permissions;
                // Se for admin, define todas as permissões
                if (user.role === 'admin') {
                    permissions = [
                        'create:user',
                        'read:user',
                        'update:user',
                        'delete:user',
                        'create:ocorrencia',
                        'read:ocorrencia',
                        'update:ocorrencia',
                        'delete:ocorrencia',
                        'read:dashboard',
                        'read:relatorio',
                        'create:foto',
                        'read:foto',
                        'update:foto',
                        'delete:foto',
                        'upload:foto'
                    ];
                }
                else {
                    // Para usuários não-admin, usa as permissões do banco
                    try {
                        permissions = JSON.parse(user.permissions);
                        if (!Array.isArray(permissions)) {
                            throw new Error('Formato de permissões inválido');
                        }
                    }
                    catch (parseError) {
                        console.error('Erro ao converter permissões:', parseError);
                        res.status(500).json({ message: 'Erro ao processar permissões do usuário' });
                        return;
                    }
                }
                console.log('Permissões do usuário:', permissions);
                const token = jsonwebtoken_1.default.sign({
                    sub: user.id,
                    nome: user.name,
                    email: user.email,
                    role: user.role,
                    permissions: permissions
                }, process.env.JWT_SECRET, { expiresIn: '12h' });
                console.log('Token gerado com sucesso');
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        permissions: permissions
                    }
                });
            }
            catch (conversionError) {
                console.error('Erro na conversão de permissões:', conversionError);
                res.status(500).json({ message: 'Erro ao processar permissões' });
            }
        }
        catch (dbError) {
            console.error('Erro ao buscar usuário:', dbError);
            // MOCK: Retorna usuário de teste quando não consegue conectar ao banco
            console.log('🔧 Usando usuário mock (banco offline)');
            // Credenciais fixas para teste
            if (email === 'admin@segtrack.com' && userPassword === '123456') {
                const permissions = [
                    'create:user',
                    'read:user',
                    'update:user',
                    'delete:user',
                    'create:ocorrencia',
                    'read:ocorrencia',
                    'update:ocorrencia',
                    'delete:ocorrencia',
                    'read:dashboard',
                    'read:relatorio',
                    'create:foto',
                    'read:foto',
                    'update:foto',
                    'delete:foto',
                    'upload:foto'
                ];
                const token = jsonwebtoken_1.default.sign({
                    sub: '1',
                    nome: 'Admin SEGTRACK',
                    email: 'admin@segtrack.com',
                    role: 'admin',
                    permissions: permissions
                }, process.env.JWT_SECRET, { expiresIn: '12h' });
                console.log('✅ Token mock gerado com sucesso');
                res.json({
                    token,
                    user: {
                        id: '1',
                        name: 'Admin SEGTRACK',
                        email: 'admin@segtrack.com',
                        role: 'admin',
                        permissions: permissions
                    }
                });
                return;
            }
            else {
                res.status(401).json({ message: 'Credenciais inválidas (modo mock: use admin@segtrack.com / 123456)' });
                return;
            }
        }
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Erro interno no login' });
    }
};
exports.login = login;
const seedAdmin = async (_req, res) => {
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        const existing = await db.user.findUnique({
            where: { email: 'admin@segtrack.com' },
        });
        if (existing) {
            res.status(400).json({ message: 'Usuário já existe' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash('123456', 10);
        const permissions = [
            'create:user',
            'read:user',
            'update:user',
            'delete:user',
            'create:ocorrencia',
            'read:ocorrencia',
            'update:ocorrencia',
            'delete:ocorrencia',
            'read:dashboard',
            'read:relatorio',
            'create:foto',
            'read:foto',
            'update:foto',
            'delete:foto',
            'upload:foto'
        ];
        const user = await db.user.create({
            data: {
                name: 'Admin SEGTRACK',
                email: 'admin@segtrack.com',
                passwordHash: hashedPassword,
                role: 'admin',
                permissions: JSON.stringify(permissions),
                active: true,
            },
        });
        res.json({ message: 'Usuário admin criado com sucesso', id: user.id });
    }
    catch (error) {
        console.error("Erro ao criar admin:", error);
        res.status(500).json({ message: 'Erro ao criar admin', error });
    }
};
exports.seedAdmin = seedAdmin;
