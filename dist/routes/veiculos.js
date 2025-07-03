"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const router = express_1.default.Router();
// Add authentication middleware to all vehicle routes
router.use(auth_middleware_1.authenticateToken);
router.get('/:placa', async (req, res) => {
    const { placa } = req.params;
    const placaFormatada = placa.toUpperCase();
    const placaValida = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    if (!placaValida.test(placaFormatada)) {
        return res.status(400).json({ erro: 'Placa inválida. Use formato AAA1234 ou AAA1B23' });
    }
    try {
        let veiculo = await (await (0, prisma_1.ensurePrisma)()).veiculo.findFirst({
            where: { placa: placaFormatada },
        });
        if (!veiculo) {
            // Criar veículo básico se não existir
            veiculo = await (await (0, prisma_1.ensurePrisma)()).veiculo.create({
                data: {
                    placa: placaFormatada,
                    modelo: 'Não informado',
                    cor: 'Não informado',
                    fabricante: 'Não informado'
                }
            });
            console.log('✅ Veículo criado:', placaFormatada);
        }
        return res.json(veiculo);
    }
    catch (err) {
        console.error('❌ Erro ao buscar/criar veículo:', err);
        return res.status(500).json({ erro: 'Erro ao processar veículo' });
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
