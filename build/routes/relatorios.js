"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../lib/db");
const router = express_1.default.Router();
// Define onde salvar os arquivos PDF
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'relatorios-pdf/');
    },
    filename: (req, file, cb) => {
        const nomeArquivo = `relatorio-${Date.now()}${path_1.default.extname(file.originalname)}`;
        cb(null, nomeArquivo);
    }
});
const upload = (0, multer_1.default)({ storage });
// 🔹 Upload do PDF gerado no frontend
router.post('/upload', upload.single('arquivo'), async (req, res) => {
    try {
        const { originalname, filename } = req.file;
        const { ocorrenciaId, cliente, tipo, dataAcionamento } = req.body;
        if (!ocorrenciaId || !cliente || !tipo || !dataAcionamento) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }
        const relatorioCriado = await db_1.prisma.relatorio.create({
            data: {
                ocorrenciaId: Number(ocorrenciaId),
                cliente,
                tipo,
                dataAcionamento: new Date(dataAcionamento),
                caminhoPdf: `relatorios-pdf/${filename}`
            }
        });
        res.status(201).json({ mensagem: 'Relatório salvo com sucesso!', relatorio: relatorioCriado });
    }
    catch (error) {
        console.error('Erro ao salvar relatório:', error);
        res.status(500).json({ error: 'Erro ao salvar relatório.' });
    }
});
exports.default = router;
