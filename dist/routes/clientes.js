"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/clientes.ts
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// ✅ NOVA ROTA PARA LISTAR CLIENTES COM ID E NOME
router.get('/resumo', async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            select: {
                id: true,
                nome: true,
            },
            orderBy: { nome: 'asc' },
        });
        res.json(clientes);
    }
    catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).json({ erro: 'Erro ao buscar clientes' });
    }
});
// 🟢 ROTAS EXISTENTES MANTIDAS ABAIXO
router.get('/', async (req, res) => {
    const clientes = await prisma.cliente.findMany({
        include: { contratos: true },
    });
    res.json(clientes);
});
router.post('/', async (req, res) => {
    const { nome, cnpj, contato, telefone, email, endereco, contratos } = req.body;
    const cliente = await prisma.cliente.create({
        data: {
            nome,
            cnpj,
            contato,
            telefone,
            email,
            endereco,
            contratos: {
                create: contratos?.map((c) => ({
                    nome_interno: c.nome_interno,
                    tipo: c.tipo,
                    regiao: c.regiao,
                    valor_acionamento: c.valor_acionamento,
                    valor_hora_extra: c.valor_hora_extra,
                    valor_km_extra: c.valor_km_extra,
                    franquia_horas: c.franquia_horas,
                    franquia_km: c.franquia_km ? parseInt(c.franquia_km) : null,
                })),
            },
        },
        include: { contratos: true },
    });
    res.json(cliente);
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, cnpj, contato, telefone, email, endereco, contratos } = req.body;
    await prisma.contrato.deleteMany({ where: { clienteId: Number(id) } });
    const cliente = await prisma.cliente.update({
        where: { id: Number(id) },
        data: {
            nome,
            cnpj,
            contato,
            telefone,
            email,
            endereco,
            contratos: {
                create: contratos?.map((c) => ({
                    nome_interno: c.nome_interno,
                    tipo: c.tipo,
                    regiao: c.regiao,
                    valor_acionamento: c.valor_acionamento,
                    valor_hora_extra: c.valor_hora_extra,
                    valor_km_extra: c.valor_km_extra,
                    franquia_horas: c.franquia_horas,
                    franquia_km: c.franquia_km ? parseInt(c.franquia_km) : null,
                })),
            },
        },
        include: { contratos: true },
    });
    res.json(cliente);
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.contrato.deleteMany({ where: { clienteId: Number(id) } });
    await prisma.cliente.delete({ where: { id: Number(id) } });
    res.status(204).end();
});
exports.default = router;
