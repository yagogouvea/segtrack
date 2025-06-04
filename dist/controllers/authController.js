"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../lib/db"));
// Função auxiliar para converter permissões de objeto para array
function permissionsObjectToArray(permissionsObj) {
    const permissions = [];
    // Mapeia as permissões do objeto para o formato de array
    Object.entries(permissionsObj).forEach(([module, actions]) => {
        Object.entries(actions).forEach(([action, enabled]) => {
            if (enabled) {
                if (action === 'read')
                    permissions.push(`view_${module}`);
                else
                    permissions.push(`${action}_${module.slice(0, -1)}`);
            }
        });
    });
    return permissions;
}
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
            let permissions;
            // Se for admin, define todas as permissões como true
            if (user.role === 'admin') {
                permissions = {
                    users: {
                        read: true,
                        create: true,
                        update: true,
                        delete: true
                    },
                    ocorrencias: {
                        read: true,
                        create: true,
                        update: true,
                        delete: true
                    },
                    dashboard: {
                        read: true
                    },
                    prestadores: {
                        read: true,
                        create: true,
                        update: true,
                        delete: true
                    },
                    relatorios: {
                        read: true,
                        create: true,
                        update: true,
                        delete: true
                    },
                    clientes: {
                        read: true,
                        create: true,
                        update: true,
                        delete: true
                    }
                };
            }
            else {
                // Para usuários não-admin, usa as permissões do banco
                permissions = JSON.parse(user.permissions);
            }
            console.log('Permissões do usuário:', permissions);
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                name: user.name,
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
