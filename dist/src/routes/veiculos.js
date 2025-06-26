"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = express_1.default.Router();
router.get('/:placa', async (req, res) => {
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
        let veiculo = await prisma_1.default.veiculo.findFirst({
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
            const dados = response.data?.response;
            console.log('🔎 Dados recebidos da API Brasil:', dados);
            if (!dados?.modelo) {
                return res.status(404).json({ erro: 'Veículo não encontrado' });
            }
            veiculo = await prisma_1.default.veiculo.create({
                data: {
                    placa: placaFormatada,
                    modelo: dados.modelo || '',
                    cor: dados.cor_veiculo?.cor || dados.cor || '',
                    fabricante: dados.marca || ''
                }
            });
        }
        res.json(veiculo);
    }
    catch (error) {
        console.error('❌ Erro ao buscar veículo:', error.message);
        if (error.response) {
            console.error('➡️ Erro da API Brasil:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        res.status(500).json({ erro: 'Erro ao buscar dados do veículo' });
    }
});
exports.default = router;
//# sourceMappingURL=veiculos.js.map