"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const prestador_controller_1 = require("../controllers/prestador.controller");
const router = express_1.default.Router();
const controller = new prestador_controller_1.PrestadorController();
// GET - Listar todos os prestadores (completo)
// Query params suportados: nome, cod_nome, regioes (csv), funcoes (csv), page, pageSize
router.get('/', (req, res) => controller.list(req, res));
// GET - Listar prestadores resumido (para formulários)
router.get('/resumo', async (req, res) => {
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        if (!db) {
            return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
        }
        const prestadores = await db.prestador.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true
            },
            where: {
                aprovado: true // Apenas prestadores aprovados
            },
            orderBy: {
                nome: 'asc'
            }
        });
        res.json(prestadores);
    }
    catch (error) {
        console.error('Erro ao buscar prestadores resumo:', error);
        res.status(500).json({ error: 'Erro ao buscar prestadores' });
    }
});
// GET - Buscar prestador por ID
router.get('/:id', (req, res) => controller.getById(req, res));
// POST - Criar novo prestador
router.post('/', (req, res) => controller.create(req, res));
// PUT - Atualizar prestador
router.put('/:id', (req, res) => controller.update(req, res));
// DELETE - Deletar prestador
router.delete('/:id', (req, res) => controller.delete(req, res));
exports.default = router;
