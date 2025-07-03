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
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const controller = new cliente_controller_1.ClienteController();
// Configuração do multer para upload de logos
const logoStorage = multer_1.default.diskStorage({
    destination: path_1.default.resolve(__dirname, '../../uploads/logos'),
    filename: (_req, file, callback) => {
        const hash = crypto_1.default.randomBytes(6).toString('hex');
        const fileName = `logo-${hash}-${file.originalname}`;
        callback(null, fileName);
    }
});
const logoUpload = (0, multer_1.default)({
    storage: logoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (_req, file, callback) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new Error('Tipo de arquivo inválido. Apenas JPG, PNG e GIF são permitidos.'));
        }
    }
});
// Middleware de autenticação para todas as rotas
router.use(auth_middleware_1.authenticateToken);
// ✅ NOVA ROTA PARA LISTAR CLIENTES COM ID E NOME
router.get('/resumo', (req, res) => controller.list(req, res));
// Listar todos os clientes com seus contratos
router.get('/', (req, res) => controller.list(req, res));
// Buscar cliente por ID
router.get('/:id', (req, res) => controller.getById(req, res));
// Criar novo cliente
router.post('/', (req, res) => controller.create(req, res));
// Atualizar cliente existente
router.put('/:id', (req, res) => controller.update(req, res));
// Excluir cliente
router.delete('/:id', (req, res) => controller.delete(req, res));
// Upload de logo
router.post('/upload-logo', logoUpload.single('logo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
        }
        const filename = req.file.filename;
        const logoPath = `/uploads/logos/${filename}`;
        const fullUrl = `${req.protocol}://${req.get('host')}${logoPath}`;
        res.json({
            logoPath: fullUrl,
            filename: filename
        });
    }
    catch (error) {
        console.error('Erro ao fazer upload do logo:', error);
        res.status(500).json({ error: 'Erro ao fazer upload do logo.' });
    }
});
exports.default = router;
