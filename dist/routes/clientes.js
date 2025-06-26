"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/clientes.ts
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cliente_controller_1 = require("../controllers/cliente.controller");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const controller = new cliente_controller_1.ClienteController();
// Aplicar autenticação em todas as rotas
router.use(auth_middleware_1.authenticateToken);
// Configuração do multer para upload de logos
const LOGOS_DIR = path_1.default.resolve(__dirname, '../../uploads/logos');
// Garantir que a pasta uploads/logos existe
if (!fs_1.default.existsSync(LOGOS_DIR)) {
    fs_1.default.mkdirSync(LOGOS_DIR, { recursive: true });
}
const logoStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, LOGOS_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const ext = path_1.default.extname(file.originalname).toLowerCase() || '.png';
        cb(null, `logo-${uniqueSuffix}${ext}`);
    }
});
const uploadLogo = (0, multer_1.default)({
    storage: logoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo inválido. Apenas JPG, PNG, GIF e WEBP são permitidos.'));
        }
    }
});
// Rota para upload de logo
router.post('/upload-logo', (0, auth_middleware_1.requirePermission)('update:cliente'), uploadLogo.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        const logoPath = `uploads/logos/${req.file.filename}`;
        res.status(200).json({
            success: true,
            logoPath,
            message: 'Logo enviado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao fazer upload do logo:', error);
        res.status(500).json({ error: 'Erro ao fazer upload do logo' });
    }
});
// ✅ NOVA ROTA PARA LISTAR CLIENTES COM ID E NOME
router.get('/resumo', (0, auth_middleware_1.requirePermission)('read:cliente'), (req, res) => controller.list(req, res));
// Listar todos os clientes com seus contratos
router.get('/', (0, auth_middleware_1.requirePermission)('read:cliente'), (req, res) => controller.list(req, res));
// Buscar cliente por ID
router.get('/:id', (0, auth_middleware_1.requirePermission)('read:cliente'), (req, res) => controller.getById(req, res));
// Criar novo cliente
router.post('/', (0, auth_middleware_1.requirePermission)('create:cliente'), (req, res) => controller.create(req, res));
// Atualizar cliente existente
router.put('/:id', (0, auth_middleware_1.requirePermission)('update:cliente'), (req, res) => controller.update(req, res));
// Excluir cliente
router.delete('/:id', (0, auth_middleware_1.requirePermission)('delete:cliente'), (req, res) => controller.delete(req, res));
exports.default = router;
