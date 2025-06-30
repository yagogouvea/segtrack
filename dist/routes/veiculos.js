"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
router.get('/:placa', async (req, res) => {
    var _a, _b;
    const { placa } = req.params;
    const placaFormatada = placa.toUpperCase();
    const placaValida = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    if (!placaValida.test(placaFormatada)) {
        return res.status(400).json({ erro: 'Placa inválida. Use formato AAA1234 ou AAA1B23' });
    }
    if (!process.env.API_BRASIL_DEVICE || !process.env.API_BRASIL_BEARER) {
        return res.status(500).json({ erro: 'Tokens da API Brasil não configurados' });
    }
    try {
        let veiculo = await (await (0, prisma_1.ensurePrisma)()).veiculo.findFirst({
            where: { placa: placaFormatada },
        });
        if (!veiculo) {
            const response = await axios_1.default.post('https://gateway.apibrasil.io/api/v2/vehicles/dados', { placa: placaFormatada }, {
                headers: {
                    'Content-Type': 'application/json',
                    'DeviceToken': process.env.API_BRASIL_DEVICE,
                    'Authorization': `Bearer ${process.env.API_BRASIL_BEARER}`
                }
            });
            const dados = (_a = response.data) === null || _a === void 0 ? void 0 : _a.response;
            console.log('🔎 Dados recebidos da API Brasil:', dados);
            if (!(dados === null || dados === void 0 ? void 0 : dados.modelo)) {
                return res.status(404).json({ erro: 'Veículo não encontrado' });
            }
            veiculo = await (await (0, prisma_1.ensurePrisma)()).veiculo.create({
                data: {
                    placa: placaFormatada,
                    modelo: dados.modelo || '',
                    cor: ((_b = dados.cor_veiculo) === null || _b === void 0 ? void 0 : _b.cor) || dados.cor || '',
                    fabricante: dados.marca || ''
                }
            });
        }
        return res.json(veiculo);
    }
    catch (err) {
        console.error('❌ Erro ao buscar veículo:', err);
        return res.status(500).json({ erro: 'Erro ao buscar veículo' });
    }
});
router.get('/', async (req, res) => {
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        const veiculos = await db.veiculo.findMany();
        res.json(veiculos);
    }
    catch (error) {
        console.error('Erro ao listar veículos:', error);
        res.status(500).json({ error: 'Erro ao listar veículos' });
    }
});
exports.default = router;
