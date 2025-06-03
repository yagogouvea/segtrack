"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../lib/db"));
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Tentativa de login para:', email);
        const user = await db_1.default.user.findUnique({
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
            role: user?.role,
            active: user?.active,
            permissions: user?.permissions
        });
        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        if (!user.active) {
            return res.status(403).json({ message: 'Usuário desativado. Entre em contato com o administrador.' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        console.log('Resultado da verificação de senha:', { isMatch });
        if (!isMatch) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }
        try {
            // Parse as permissões da string JSON
            const userPermissions = JSON.parse(user.permissions);
            // Converte as permissões do formato array para o formato de objeto
            const permissionsObj = {
                users: {
                    read: userPermissions.includes('view_users'),
                    create: userPermissions.includes('create_user'),
                    update: userPermissions.includes('edit_user'),
                    delete: userPermissions.includes('delete_user')
                },
                ocorrencias: {
                    read: userPermissions.includes('view_ocorrencias'),
                    create: userPermissions.includes('create_ocorrencia'),
                    update: userPermissions.includes('edit_ocorrencia'),
                    delete: userPermissions.includes('delete_ocorrencia')
                }
            };
            console.log('Permissões convertidas:', permissionsObj);
            // Se o usuário for admin, todas as permissões são true
            if (user.role === 'admin') {
                console.log('Usuário é admin, atribuindo todas as permissões');
                permissionsObj.users = {
                    read: true,
                    create: true,
                    update: true,
                    delete: true
                };
                permissionsObj.ocorrencias = {
                    read: true,
                    create: true,
                    update: true,
                    delete: true
                };
            }
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                name: user.name,
                role: user.role,
                permissions: permissionsObj
            }, process.env.JWT_SECRET, { expiresIn: '12h' });
            console.log('Token gerado com sucesso');
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions: permissionsObj
                }
            });
        }
        catch (conversionError) {
            console.error('Erro na conversão de permissões:', conversionError);
            throw conversionError;
        }
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Erro interno no login', error });
    }
};
exports.login = login;
const seedAdmin = async (_req, res) => {
    try {
        const existing = await db_1.default.user.findUnique({
            where: { email: 'admin@segtrack.com' },
        });
        if (existing) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }
        const hashedPassword = await bcrypt_1.default.hash('123456', 10);
        const permissions = JSON.stringify([
            'view_users',
            'create_user',
            'edit_user',
            'export_pdf',
            'view_finance',
        ]);
        const user = await db_1.default.user.create({
            data: {
                name: 'Admin SEGTRACK',
                email: 'admin@segtrack.com',
                passwordHash: hashedPassword,
                role: 'admin',
                permissions,
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
