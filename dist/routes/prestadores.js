"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET - Listar todos os prestadores (completo)
router.get('/', async (req, res) => {
    try {
        const prestadores = await prisma.prestador.findMany({
            include: {
                funcoes: true,
                regioes: true,
                veiculos: true
            },
            orderBy: { nome: 'asc' }
        });
        // Formatando a resposta para incluir todos os campos necessários
        const prestadoresFormatados = prestadores.map(prestador => ({
            ...prestador,
            funcoes: prestador.funcoes.map(f => f.funcao),
            regioes: prestador.regioes.map(r => r.regiao),
            tipo_veiculo: prestador.veiculos.map(v => v.tipo),
            // Formatando valores monetários e numéricos
            valor_acionamento: prestador.valor_acionamento || 0,
            valor_hora_adc: prestador.valor_hora_adc || 0,
            valor_km_adc: prestador.valor_km_adc || 0,
            franquia_km: prestador.franquia_km || 0,
            franquia_horas: prestador.franquia_horas || ''
        }));
        res.json(prestadoresFormatados);
    }
    catch (err) {
        console.error('❌ Erro ao listar prestadores:', err);
        res.status(500).json({ erro: 'Erro ao listar prestadores' });
    }
});
// 🔹 NOVA ROTA - Listar prestadores para popup de seleção (nome e codinome)
router.get('/popup', async (req, res) => {
    try {
        const prestadores = await prisma.prestador.findMany({
            select: {
                id: true,
                nome: true,
                cod_nome: true
            },
            orderBy: { nome: 'asc' }
        });
        res.json(prestadores);
    }
    catch (err) {
        console.error('❌ Erro ao buscar prestadores para popup:', err);
        res.status(500).json({ erro: 'Erro ao buscar prestadores' });
    }
});
// ✅ NOVA ROTA - Buscar prestador por nome (usado no popup de passagem de serviço)
// ✅ ROTA CORRIGIDA - Buscar prestador por nome (sem usar `mode`)
router.get('/buscar-por-nome/:nome', async (req, res) => {
    const { nome } = req.params;
    try {
        const prestador = await prisma.prestador.findFirst({
            where: {
                nome: {
                    contains: nome
                }
            },
            select: {
                nome: true,
                telefone: true
            }
        });
        if (!prestador) {
            return res.status(404).json({ erro: 'Prestador não encontrado' });
        }
        res.json(prestador);
    }
    catch (err) {
        console.error('❌ Erro ao buscar prestador por nome:', err);
        res.status(500).json({ erro: 'Erro ao buscar prestador' });
    }
});
// POST - Criar novo prestador
router.post('/', async (req, res) => {
    const { nome, cpf, cod_nome, telefone, email, aprovado, tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado, valor_acionamento, franquia_horas, franquia_km, valor_hora_adc, valor_km_adc, funcoes, regioes } = req.body;
    try {
        const existente = await prisma.prestador.findFirst({ where: { cpf } });
        if (existente) {
            res.status(400).json({ erro: 'Já existe um prestador com este CPF' });
            return;
        }
        const novo = await prisma.prestador.create({
            data: {
                nome, cpf, cod_nome, telefone, email, aprovado,
                tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado,
                valor_acionamento, franquia_horas, franquia_km, valor_hora_adc, valor_km_adc,
                funcoes: { create: funcoes?.map((f) => ({ funcao: f })) },
                regioes: { create: regioes?.map((r) => ({ regiao: r })) }
            },
            include: { funcoes: true, regioes: true }
        });
        res.status(201).json(novo);
    }
    catch (err) {
        console.error('❌ Erro ao criar prestador:', err);
        res.status(500).json({ erro: 'Erro ao criar prestador' });
    }
});
// PUT - Atualizar prestador
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Atualizando prestador:', { id, body: req.body });
    const { nome, cpf, cod_nome, telefone, email, aprovado, tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado, valor_acionamento, franquia_horas, franquia_km, valor_hora_adc, valor_km_adc, funcoes, regioes, tipo_veiculo } = req.body;
    try {
        // Deletar registros relacionados existentes
        console.log('Deletando registros relacionados antigos...');
        await prisma.funcaoPrestador.deleteMany({ where: { prestadorId: Number(id) } });
        await prisma.regiaoPrestador.deleteMany({ where: { prestadorId: Number(id) } });
        await prisma.tipoVeiculoPrestador.deleteMany({ where: { prestadorId: Number(id) } });
        console.log('Atualizando prestador com novos dados...');
        const atualizado = await prisma.prestador.update({
            where: { id: Number(id) },
            data: {
                nome, cpf, cod_nome, telefone, email, aprovado,
                tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado,
                valor_acionamento, franquia_horas, franquia_km, valor_hora_adc, valor_km_adc,
                funcoes: {
                    create: funcoes?.map((f) => ({ funcao: f }))
                },
                regioes: {
                    create: regioes?.map((r) => ({ regiao: r }))
                },
                veiculos: {
                    create: tipo_veiculo?.map((v) => ({ tipo: v }))
                }
            },
            include: {
                funcoes: true,
                regioes: true,
                veiculos: true
            }
        });
        console.log('Prestador atualizado com sucesso:', atualizado);
        res.json(atualizado);
    }
    catch (err) {
        console.error('❌ Erro ao editar prestador:', err);
        res.status(500).json({
            erro: 'Erro ao editar prestador',
            detalhes: err instanceof Error ? err.message : String(err)
        });
    }
});
// PUT - Aprovar prestador
router.put('/:id/aprovar', async (req, res) => {
    const { id } = req.params;
    try {
        const prestador = await prisma.prestador.findUnique({
            where: { id: Number(id) }
        });
        if (!prestador) {
            return res.status(404).json({ erro: 'Prestador não encontrado' });
        }
        if (prestador.aprovado) {
            return res.status(400).json({ erro: 'Prestador já está aprovado' });
        }
        const atualizado = await prisma.prestador.update({
            where: { id: Number(id) },
            data: {
                aprovado: true
            }
        });
        res.json(atualizado);
    }
    catch (err) {
        console.error('❌ Erro ao aprovar prestador:', err);
        res.status(500).json({ erro: 'Erro ao aprovar prestador' });
    }
});
// DELETE - Excluir prestador
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.funcaoPrestador.deleteMany({ where: { prestadorId: Number(id) } });
        await prisma.regiaoPrestador.deleteMany({ where: { prestadorId: Number(id) } });
        await prisma.prestador.delete({ where: { id: Number(id) } });
        res.status(204).end();
    }
    catch (err) {
        console.error('❌ Erro ao excluir prestador:', err);
        res.status(500).json({ erro: 'Erro ao excluir prestador' });
    }
});
exports.default = router;
