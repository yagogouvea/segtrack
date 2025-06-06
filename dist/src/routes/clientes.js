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
// Listar todos os clientes com seus contratos
router.get('/', async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            include: { contratos: true },
        });
        res.json(clientes);
    }
    catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).json({ erro: 'Erro ao buscar clientes' });
    }
});
// Buscar cliente por ID
router.get('/:id', async (req, res) => {
    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id: Number(req.params.id) },
            include: { contratos: true },
        });
        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado' });
        }
        res.json(cliente);
    }
    catch (err) {
        console.error('Erro ao buscar cliente:', err);
        res.status(500).json({ erro: 'Erro ao buscar cliente' });
    }
});
// Criar novo cliente
router.post('/', async (req, res) => {
    try {
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
                        valor_acionamento: c.valor_acionamento ? parseFloat(String(c.valor_acionamento).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        valor_nao_recuperado: c.valor_nao_recuperado ? parseFloat(String(c.valor_nao_recuperado).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        valor_hora_extra: c.valor_hora_extra ? parseFloat(String(c.valor_hora_extra).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        valor_km_extra: c.valor_km_extra ? parseFloat(String(c.valor_km_extra).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        franquia_horas: c.franquia_horas,
                        franquia_km: c.franquia_km ? parseInt(c.franquia_km) : null,
                        valor_km: c.valor_km ? parseFloat(String(c.valor_km).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        valor_base: c.valor_base ? parseFloat(String(c.valor_base).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        permite_negociacao: c.permite_negociacao || false,
                    })),
                },
            },
            include: { contratos: true },
        });
        res.json(cliente);
    }
    catch (err) {
        console.error('Erro ao criar cliente:', err);
        res.status(500).json({ erro: 'Erro ao criar cliente' });
    }
});
// Atualizar cliente existente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cnpj, contato, telefone, email, endereco, contratos } = req.body;
        // Primeiro exclui todos os contratos existentes
        await prisma.contrato.deleteMany({
            where: { clienteId: Number(id) },
        });
        // Depois atualiza o cliente e cria os novos contratos
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
                        valor_acionamento: c.valor_acionamento ? parseFloat(String(c.valor_acionamento).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        valor_nao_recuperado: c.valor_nao_recuperado ? parseFloat(String(c.valor_nao_recuperado).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        valor_hora_extra: c.valor_hora_extra ? parseFloat(String(c.valor_hora_extra).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        valor_km_extra: c.valor_km_extra ? parseFloat(String(c.valor_km_extra).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        franquia_horas: c.franquia_horas,
                        franquia_km: c.franquia_km ? parseInt(c.franquia_km) : null,
                        valor_km: c.valor_km ? parseFloat(String(c.valor_km).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        valor_base: c.valor_base ? parseFloat(String(c.valor_base).replace(/[^\d.,]/g, '').replace(',', '.')) : null,
                        permite_negociacao: c.permite_negociacao || false,
                    })),
                },
            },
            include: { contratos: true },
        });
        res.json(cliente);
    }
    catch (err) {
        console.error('Erro ao atualizar cliente:', err);
        res.status(500).json({ erro: 'Erro ao atualizar cliente' });
    }
});
// Excluir cliente
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Primeiro exclui todos os contratos
        await prisma.contrato.deleteMany({
            where: { clienteId: Number(id) },
        });
        // Depois exclui o cliente
        await prisma.cliente.delete({
            where: { id: Number(id) },
        });
        res.status(204).end();
    }
    catch (err) {
        console.error('Erro ao excluir cliente:', err);
        res.status(500).json({ erro: 'Erro ao excluir cliente' });
    }
});
exports.default = router;
//# sourceMappingURL=clientes.js.map